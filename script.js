document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const selectFilesBtn = document.querySelector('.select-files-btn');
    const saveButton = document.getElementById('saveButton');
    let uploadedFiles = [];

    // Eventos para o botão de seleção de arquivos
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Eventos de drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        [...files].forEach(file => {
            uploadedFiles.push(file);
            previewFile(file);
        });
        updateSaveButton();
    }

    function getFileIcon(file) {
        // Ícones do Material Design para diferentes tipos de arquivo
        const icons = {
            // Arquivos de imagem
            'image': 'image',
            'pdf': 'picture_as_pdf',
            'text': 'description',
            'audio': 'audio_file',
            'video': 'video_file',
            'zip': 'folder_zip',
            
            // Arquivos de programação
            'javascript': 'javascript',
            'typescript': 'code',
            'python': 'code',
            'java': 'code',
            'csharp': 'code',
            'cpp': 'code',
            'php': 'code',
            'html': 'html',
            'css': 'css',
            'json': 'data_object',
            'xml': 'code',
            'sql': 'storage',
            'shell': 'terminal',
            'markdown': 'description',
            'yaml': 'code',
            'docker': 'docker',
            'git': 'git',
            'config': 'settings',
            'env': 'environment',
            'log': 'article',
            'database': 'database',
            'default': 'insert_drive_file'
        };

        // Verificar extensões específicas
        const extension = file.name.split('.').pop().toLowerCase();
        const extensionMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'java': 'java',
            'cs': 'csharp',
            'cpp': 'cpp',
            'c': 'cpp',
            'h': 'cpp',
            'php': 'php',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'css',
            'sass': 'css',
            'json': 'json',
            'xml': 'xml',
            'sql': 'sql',
            'sh': 'shell',
            'bash': 'shell',
            'md': 'markdown',
            'yml': 'yaml',
            'yaml': 'yaml',
            'dockerfile': 'docker',
            'gitignore': 'git',
            'config': 'config',
            'conf': 'config',
            'env': 'env',
            'log': 'log',
            'db': 'database',
            'sqlite': 'database',
            'mysql': 'database',
            'postgresql': 'database'
        };

        // Verificar tipo MIME
        if (file.type.startsWith('image/')) return icons.image;
        if (file.type.includes('pdf')) return icons.pdf;
        if (file.type.startsWith('text/')) return icons.text;
        if (file.type.startsWith('audio/')) return icons.audio;
        if (file.type.startsWith('video/')) return icons.video;
        if (file.type.includes('zip') || file.type.includes('rar')) return icons.zip;

        // Verificar extensão
        if (extensionMap[extension]) {
            return icons[extensionMap[extension]];
        }

        return icons.default;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function previewFile(file) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const fileIcon = document.createElement('span');
        fileIcon.className = 'material-icons file-icon';
        fileIcon.textContent = getFileIcon(file);

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;

        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            const index = uploadedFiles.indexOf(file);
            if (index > -1) {
                uploadedFiles.splice(index, 1);
            }
            previewItem.remove();
            updateSaveButton();
        };

        previewItem.appendChild(fileIcon);
        previewItem.appendChild(fileInfo);
        previewItem.appendChild(removeBtn);
        previewContainer.appendChild(previewItem);
    }

    function updateSaveButton() {
        saveButton.disabled = uploadedFiles.length === 0;
    }

    // Função para enviar um arquivo para o servidor
    async function uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const folderPath = document.getElementById('folderPath').value.trim();
            if (folderPath) {
                formData.append('folderPath', folderPath);
            }

            const response = await fetch('http://localhost:3000/save-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar ${file.name}`);
            }

            const result = await response.json();
            console.log(`Arquivo ${file.name} salvo com sucesso em: ${result.path}`);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${file.name}:`, error);
            return false;
        }
    }

    saveButton.addEventListener('click', async () => {
        if (uploadedFiles.length === 0) return;

        const folderPath = document.getElementById('folderPath').value.trim();
        if (!folderPath) {
            alert('Por favor, digite o caminho da pasta de destino');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        alert(`Os arquivos serão salvos na pasta: ${folderPath}`);

        for (const file of uploadedFiles) {
            const success = await uploadFile(file);
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
        }

        if (errorCount === 0) {
            alert(`Todos os ${successCount} arquivos foram salvos com sucesso!`);
            uploadedFiles = [];
            previewContainer.innerHTML = '';
            updateSaveButton();
        } else {
            alert(`${successCount} arquivos foram salvos com sucesso e ${errorCount} falharam.`);
        }
    });
}); 