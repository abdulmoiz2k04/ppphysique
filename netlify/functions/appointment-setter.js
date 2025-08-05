exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { message, step } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    let prompt;
    if (step === 'greeting') {
        prompt = `You are an AI appointment setter for PP Physique Studio. Your first job is to greet the user enthusiastically and ask them what their primary fitness goal is. Give them three clear options to choose from: "Build Muscle", "Burn Fat", or "Improve Performance".`;
    } else {
        prompt = `You are an AI appointment setter for PP Physique Studio. The user has expressed interest in a goal. Your job is to respond enthusiastically, validate their choice, and then ask them to provide their name and email to book a free consultation for that goal. Keep it short and encouraging. The user's message is: "${message}"`;
    }

    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API request failed`);
        
        const result = await response.json();
        let reply = result.candidates[0].content.parts[0].text;

        reply = reply.replace(/\*\*/g, '');

        return { statusCode: 200, body: JSON.stringify({ reply: reply.trim() }) };
    } catch (error) {
        console.error("Function Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch AI response." }) };
    }
};