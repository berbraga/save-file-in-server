const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Habilitar CORS
app.use(cors());

// Configuração do multer para salvar os arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = req.body.folderPath || '/mnt';
        
        // Criar a pasta se não existir
        if (!fs.existsSync(folderPath)) {
            try {
                fs.mkdirSync(folderPath, { recursive: true });
            } catch (error) {
                console.error(`Erro ao criar pasta ${folderPath}:`, error);
                return cb(new Error(`Não foi possível criar a pasta ${folderPath}`));
            }
        }
        
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        // Adiciona timestamp ao nome do arquivo para evitar duplicatas
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota para salvar arquivos
app.post('/save-image', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        res.json({ 
            message: 'Arquivo salvo com sucesso',
            filename: req.file.filename,
            path: req.file.path
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Pasta padrão para upload: /mnt`);
}); 