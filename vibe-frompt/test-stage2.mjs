async function testStage2() {
    console.log('Testing Stage 2: Master Prompt Synthesis...');

    try {
        const imgUrl = 'https://picsum.photos/300/200';
        console.log('Fetching image from:', imgUrl);
        const imgRes = await fetch(imgUrl);
        const buffer = await imgRes.arrayBuffer();
        const imageBase64 = Buffer.from(buffer).toString('base64');

        const components = {
            subject: 'Một người đàn ông cổ đại đang ngồi viết lách',
            environment: 'Căn phòng tối, có bản đồ lớn trên bàn',
            cinematography: 'Góc quay cận cảnh, ánh sáng nến leo lét',
            style: 'Phong cách nghệ thuật chi tiết, tông màu vàng kim và xám'
        };

        const res = await fetch('http://localhost:3000/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'generate_final',
                imageBase64,
                mimeType: 'image/jpeg',
                components
            }),
        });

        const data = await res.json();
        console.log('API Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.prompts && data.prompts.master) {
            console.log('\n✅ Stage 2 Test SUCCESS!');
            console.log('Master Prompt Sample:', data.prompts.master.slice(0, 100) + '...');
        } else {
            console.log('\n❌ Stage 2 Test FAILED: Missing prompts in response.');
        }
    } catch (e) {
        console.error('\n❌ Test execution failed:', e.message);
    }
}

testStage2();
