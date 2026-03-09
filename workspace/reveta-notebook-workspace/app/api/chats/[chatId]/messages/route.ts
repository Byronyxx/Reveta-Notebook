import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeRAGQuery } from '@/lib/ai/rag'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await params
    const { content } = await req.json()

    if (!content || typeof content !== 'string') {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify chat ownership and get notebookId
    const { data: chatRow, error: chatErr } = await supabase
        .from('chats')
        .select('user_id, notebook_id')
        .eq('id', chatId)
        .single()

    if (chatErr || !chatRow || chatRow.user_id !== user.id) {
        return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    // Save the user's incoming message
    const { error: insertUserErr } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            role: 'user',
            content: content
        })

    if (insertUserErr) {
        return NextResponse.json({ error: 'Failed to record message' }, { status: 500 })
    }

    // Fetch full chat history for context
    const { data: historyData } = await supabase
        .from('messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    // Format history for Anthropic schema
    type MessageParam = { role: 'user' | 'assistant', content: string };
    const formattedHistory: MessageParam[] = (historyData || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))

    try {
        const ragResult = await executeRAGQuery({
            notebookId: chatRow.notebook_id,
            userId: user.id,
            userQuery: content,
            chatHistory: formattedHistory.slice(0, -1) // Exclude the message we just added since executeRAGQuery appends it.
        })

        // Save assistant response
        const { data: assistantMsg, error: insertAssistantErr } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                role: 'assistant',
                content: ragResult.answer,
                metadata: { sources: ragResult.sources }
            })
            .select()
            .single()

        if (insertAssistantErr) {
            console.error(insertAssistantErr)
            return NextResponse.json({ error: 'Failed to save assistant response' }, { status: 500 })
        }

        return NextResponse.json({
            message: assistantMsg,
            sources: ragResult.sources
        })

    } catch (err: unknown) {
        const errorMsg = (err instanceof Error) ? err.message : String(err);
        console.error('RAG Pipeline Error:', errorMsg);

        // Attempt saving an error reply so the user isn't stuck waiting
        await supabase.from('messages').insert({
            chat_id: chatId, role: 'assistant', content: `[System Error: ${errorMsg}]`
        });

        return NextResponse.json({ error: 'Failed during AI ingestion pipeline' }, { status: 500 })
    }
}
