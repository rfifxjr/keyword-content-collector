document.getElementById('search').addEventListener('click', async () => {
    const keyword = document.getElementById('keyword').value;
    const response = await fetch('http://localhost:3000/get-urls', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword })
    });
    
    const urls = await response.json();
    const urlList = document.getElementById('url-list');
    urlList.innerHTML = '';
    
    if (Array.isArray(urls)) {
        urls.forEach(url => {
            const li = document.createElement('li');
            li.textContent = url;
            li.addEventListener('click', () => downloadContent(url));
            urlList.appendChild(li);
        });
    } else {
        urlList.innerHTML = '<li>Не найдено URL для этого ключевого слова</li>';
    }
});

async function downloadContent(url) {
    const response = await fetch('http://localhost:3000/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });

    const reader = response.body.getReader();
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    const progressDiv = document.getElementById('progress');
    progressDiv.innerHTML = '';
    
    document.getElementById('status-header').style.display = 'block';
    progressDiv.style.display = 'block';
    contentDiv.style.display = 'block';

    let totalBytes = 0;
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        totalBytes += value.length;
        receivedBytes += value.length;

        const progress = Math.round((receivedBytes / totalBytes) * 100);
        progressDiv.innerHTML = `Загрузка: ${progress}%`;
        
        contentDiv.innerHTML += new TextDecoder("utf-8").decode(value);
    }
}
