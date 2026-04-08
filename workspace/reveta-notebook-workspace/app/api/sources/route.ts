import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processIngestJob } from '@/lib/ingest/pipeline'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const sourceSchema = z.object({
    notebookId: z.string().uuid("Invalid notebookId"),
    url: z.string().url().optional().or(z.literal('')),
    file: z.any().optional()
}).refine(data => data.url || data.file, {
    message: "Must provide either file or url",
    path: ["url"]
});

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const rawNotebookId = formData.get('notebookId');
        const rawUrl = formData.get('url');
        const file = formData.get('file') as File | null;

        const parseResult = sourceSchema.safeParse({
            notebookId: rawNotebookId,
            url: rawUrl,
            file
        });

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
        }

        const { notebookId, url } = parseResult.data;

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

        const title = file ? filename : new URL(url as string).hostname;

        // Determine format tag
        let sourceType = 'txt';
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) sourceType = 'youtube';
        else if (url) sourceType = 'url';
        else if (filename.endsWith('.pdf') || mimetype === 'application/pdf') sourceType = 'pdf';
        else if (filename.endsWith('.docx') || mimetype.includes('wordprocessingml')) sourceType = 'docx';
        else if (filename.endsWith('.mp3') || filename.endsWith('.wav') || mimetype.startsWith('audio/')) sourceType = 'audio';

        // Use admin client for DB operations — user identity already verified above
        const adminDb = createAdminClient()
        const { data: sourceRow, error: insertError } = await adminDb
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
