const progress = document.getElementById("progress");
const statusElm = document.getElementById("status");
const firstLang = document.getElementById("firstLang");
const secondLang = document.getElementById("secondLang");


const worker = await Tesseract.createWorker(`${firstLang.value}+${secondLang.value}`, 1, {
    logger: function(m) {
        statusElm.innerHTML = m.status;
        progress.innerHTML = (m.progress * 100).toFixed(0) + "%";
        if (m.progress === 1) {
            statusElm.innerHTML = "";
            progress.innerHTML = "";
        }
    }
});

document.getElementById('upload-button').addEventListener('click', function() {
    document.getElementById('uploader').click();
})

document.getElementById('uploader').addEventListener('change', async function(e) {
    const files = e.target.files;
    let res;
    const isAra = firstLang.value === 'ara';

    for (let i = 0; i < files.length; i++) {
        const ret = await worker.recognize(files[i]);
        const lines = ret.data.text.split("\n");
        res = lines.map(line => line.split('-')).filter(l => l[0] !== '');

        if (isAra) {
            res = res.map(l => [l[0], l[1]] = [l[1], l[0]]);
        }

        res = res.map(r => r.map(rl => rl.trim()));
    }

    statusElm.innerHTML = '100%';
    progress.innerHTML = 'Done';

    createTable(res);
    downloadCSV(arrayToCSV(res));
});

function arrayToCSV(data) {
    const csvRows = [];
    data.forEach(row => {
        csvRows.push(row.join(','));
    });


    return csvRows.join('\n');
}

function downloadCSV(content, filename = 'anki_cards.csv') {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.getElementById('download');
    a.classList.remove('hidden');
    a.href = url;
    a.download = filename;
}
function createTable(array) {
    const container = document.getElementById('table-container');
    container.classList.remove("hidden");
    container.innerHTML = '';

    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');

    array.forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    container.appendChild(table);
}

