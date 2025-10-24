# Back-end Lyria

Este é o back-end para o aplicativo Lyria.

## Dependências

Instale as dependências do Python usando:

```bash
pip install -r requirements.txt
```

### Dependências de Sistema

Para o processamento de áudio (transcrição de arquivos `.m4a` enviados pelo aplicativo), o FFmpeg é necessário. Certifique-se de que ele esteja instalado em seu ambiente de servidor.

**Instalação do FFmpeg:**

*   **macOS (usando Homebrew):**
    ```bash
    brew install ffmpeg
    ```

*   **Linux (usando apt):**
    ```bash
    sudo apt update && sudo apt install ffmpeg
    ```

*   **Windows:**
    -   Baixe os binários do [site oficial do FFmpeg](https://ffmpeg.org/download.html).
    -   Adicione o caminho para a pasta `bin` do FFmpeg à variável de ambiente `PATH` do seu sistema.
