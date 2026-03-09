import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processIngestJob } from '@/lib/ingest/pipeline'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const notebookId = formData.get('notebookId') as string
        const url = formData.get('url') as string
        const file = formData.get('file') as File | null

        if (!notebookId) {
            return NextResponse.json({ error: 'notebookId is required' }, { status: 400 })
        }

        // Auth check: User must have 'edit' access to notebook
        const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
            check_notebook_id: notebookId,
            required_level: 'edit'
        })

        if (!hasAccess) {
            return NextResponse.json({ error: 'Insufficient permissions for this notebook' }, { status: 403 })
        }

        // Save initial pending source row
        let filename = '';
        let mimetype = '';
        let buffer: Buffer | undefined = undefined;
        let size = 0;

        if (file) {
            filename = file.name;
            mimetype = file.type;
            size = file.size;
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (!url) {
            return NextResponse.json({ error: 'Must provide either file or url' }, { status: 400 })
        }

        const title = file ? filename : new URL(url).hostname;

        // Determine format tag
        let sourceType = 'txt';
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) sourceType = 'youtube';
        else if (url) sourceType = 'url';
        else if (filename.endsWith('.pdf') || mimetype === 'application/pdf') sourceType = 'pdf';
        else if (filename.endsWith('.docx') || mimetype.includes('wordprocessingml')) sourceType = 'docx';
        else if (filename.endsWith('.mp3') || filename.endsWith('.wav') || mimetype.startsWith('audio/')) sourceType = 'audio';

        const { data: sourceRow, error: insertError } = await supabase
            .from('sources')
            .insert({
                notebook_id: notebookId,
                uploader_id: user.id,
                title: title,
                source_type: sourceType,
                file_size_bytes: size,
                original_url: url || null,
                status: 'pending'
            })
            .select('id')
            .single()

        if (insertError || !sourceRow) {
            return NextResponse.json({ error: 'Database insert failed', details: insertError?.message }, { status: 500 })
        }

        // Fire off async processing without awaiting
        const pipelineInput = {
            notebookId,
            sourceId: sourceRow.id,
            url: url || undefined,
            filename: filename || undefined,
            mimetype: mimetype || undefined,
            buffer
        };

        // Execute asynchronously (requires decent Vercel timeouts or background queues in prod)
        processIngestJob(sourceRow.id, pipelineInput).catch(console.error);

        return NextResponse.json({ sourceId: sourceRow.id, status: 'pending' }, { status: 202 })

    } catch (error: unknown) {
        const errorMsg = (error instanceof Error) ? error.message : String(error);
        return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
}
