import sqlite3
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from testeDaIa import perguntar_ollama, buscar_na_web, get_persona_texto
from banco.banco import (
    pegarPersonaEscolhida,
    escolherApersona,
    criarUsuario,
    procurarUsuarioPorEmail,
    get_usuario_por_id,
    atualizar_perfil_usuario,
    pegarHistorico,
    criar_banco,
    salvarMensagem,
    carregar_memorias,
    criar_nova_conversa,
    listar_conversas_por_usuario,
    carregar_mensagens_da_conversa,
    deletar_conversa,
    DB_NOME
)
from classificadorDaWeb.classificador_busca_web import deve_buscar_na_web
from waitress import serve

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads/profile_pics')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB limit
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

CORS(app)
bcrypt = Bcrypt(app)

@app.route('/Lyria/conversar', methods=['POST'])
def conversarSemConta():
    data = request.get_json()
    if not data or 'pergunta' not in data:
        return jsonify({"erro": "Campo 'pergunta' é obrigatório"}), 400
    pergunta = data['pergunta']
    
    try:
        contexto_web = None
        if deve_buscar_na_web(pergunta):
            contexto_web = buscar_na_web(pergunta)
        resposta = perguntar_ollama(pergunta, None, None, 'professor', contexto_web)
        return jsonify({"resposta": resposta})
        
    except Exception as e:
        import traceback
        print(f"--- ERRO DETALHADO NO ENDPOINT /conversar para o usuário: {usuario} ---")
        traceback.print_exc()
        print("------------------------------------------------------------------")
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

@app.route('/Lyria/<usuario>/conversar', methods=['POST'])
def conversar(usuario):
    data = request.get_json()
    if not data or 'pergunta' not in data:
        return jsonify({"erro": "Campo 'pergunta' é obrigatório"}), 400

    pergunta = data['pergunta']
    conversa_id = data.get('conversa_id') # ID da conversa é opcional
    new_conversa_id = None

    persona_tipo = pegarPersonaEscolhida(usuario)
    if not persona_tipo:
        return jsonify({"erro": "Usuário não tem persona definida"}), 400
    
    try:
        if not conversa_id:
            # Lógica para criar uma nova conversa se nenhum ID for fornecido
            conn = sqlite3.connect(DB_NOME)
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM usuarios WHERE nome = ?", (usuario,))
            user_row = cursor.fetchone()
            conn.close()
            if not user_row:
                return jsonify({"erro": "Usuário para criar conversa não encontrado"}), 404

            usuario_id = user_row[0]
            titulo = pergunta[:40] + '...' if len(pergunta) > 40 else pergunta
            conversa_id = criar_nova_conversa(usuario_id, titulo)
            new_conversa_id = conversa_id # Marca que um novo ID foi criado

        mensagens_atuais = carregar_mensagens_da_conversa(conversa_id)
        contexto_chat = [msg['text'] for msg in mensagens_atuais]

        memorias = carregar_memorias(usuario)
        contexto_web = None
        if deve_buscar_na_web(pergunta):
            contexto_web = buscar_na_web(pergunta)

        persona = get_persona_texto(persona_tipo)
        resposta = perguntar_ollama(pergunta, contexto_chat, memorias, persona, contexto_web)

        salvarMensagem(usuario, conversa_id, pergunta, resposta, modelo_usado="ollama", tokens=None)

        json_response = {"resposta": resposta}
        if new_conversa_id:
            json_response["new_conversa_id"] = new_conversa_id

        return jsonify(json_response)
        
    except Exception as e:
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

@app.route('/Lyria/<usuario>/conversas', methods=['GET'])
def get_conversas_usuario(usuario):
    try:
        conn = sqlite3.connect(DB_NOME)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE nome = ?", (usuario,))
        user_row = cursor.fetchone()
        conn.close()

        if not user_row:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        usuario_id = user_row[0]
        conversas = listar_conversas_por_usuario(usuario_id)
        return jsonify({"conversas": conversas})
    except Exception as e:
        import traceback
        print(f"--- ERRO DETALHADO NO ENDPOINT /conversas para o usuário: {usuario} ---")
        traceback.print_exc()
        print("------------------------------------------------------------------")
        return jsonify({"erro": f"Erro ao buscar conversas: {str(e)}"}), 500

@app.route('/Lyria/conversas/<int:conversa_id>/mensagens', methods=['GET'])
def get_mensagens_conversa(conversa_id):
    try:
        mensagens = carregar_mensagens_da_conversa(conversa_id)
        return jsonify({"mensagens": mensagens})
    except Exception as e:
        return jsonify({"erro": f"Erro ao carregar mensagens: {str(e)}"}), 500

@app.route('/Lyria/conversas/<int:conversa_id>', methods=['DELETE'])
def delete_conversa(conversa_id):
    try:
        deletar_conversa(conversa_id)
        return jsonify({"sucesso": "Conversa deletada"}), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao deletar conversa: {str(e)}"}), 500

@app.route('/Lyria/<usuario>/PersonaEscolhida', methods=['GET'])
def get_persona_escolhida(usuario):
    try:
        persona = pegarPersonaEscolhida(usuario)
        if persona:
            return jsonify({"persona": persona})
        return jsonify({"erro": "Usuário não encontrado"}), 404
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar persona: {str(e)}"}), 500

@app.route('/Lyria/<usuario>/PersonaEscolhida', methods=['POST'])
def set_persona_escolhida(usuario):
    data = request.get_json()
    if not data or 'persona' not in data:
        return jsonify({"erro": "Campo 'persona' é obrigatório"}), 400

    persona = data['persona']
    if persona not in ['professor', 'empresarial']:
        return jsonify({"erro": "Persona inválida. Use 'professor' ou 'empresarial'"}), 400

    try:
        escolherApersona(persona, usuario)
        return jsonify({"sucesso": "Persona atualizada com sucesso"})
    except Exception as e:
        return jsonify({"erro": f"Erro ao atualizar persona: {str(e)}"}), 500

@app.route('/Lyria/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'nome' not in data or 'email' not in data or 'senha' not in data:
        return jsonify({"erro": "Campos 'nome', 'email' e 'senha' são obrigatórios"}), 400

    nome = data['nome']
    email = data['email']
    senha = data['senha']
    
    senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')
    persona = data.get('persona', 'professor')

    if persona not in ['professor', 'empresarial']:
        return jsonify({"erro": "Persona inválida. Use 'professor' ou 'empresarial'"}), 400

    try:
        usuario_id = criarUsuario(nome, email, persona, senha_hash)
        return jsonify({
            "sucesso": "Usuário criado com sucesso", 
            "id": usuario_id,
            "persona": persona
        }), 201
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            return jsonify({"erro": "Usuário já existe"}), 409
        return jsonify({"erro": f"Erro ao criar usuário: {str(e)}"}), 500

@app.route('/Lyria/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'senha' not in data:
        return jsonify({"erro": "Campos 'email' e 'senha' são obrigatórios"}), 400

    email = data['email']
    senha = data['senha']

    try:
        usuario = procurarUsuarioPorEmail(email)
        if usuario and bcrypt.check_password_hash(usuario['senha_hash'], senha):
            # Omitindo a senha_hash da resposta por segurança
            usuario_sem_senha = {key: value for key, value in usuario.items() if key != 'senha_hash'}
            return jsonify({
                "sucesso": "Login bem-sucedido",
                "usuario": usuario_sem_senha
            }), 200
        else:
            return jsonify({"erro": "Email ou senha inválidos"}), 401
    except Exception as e:
        return jsonify({"erro": f"Erro ao fazer login: {str(e)}"}), 500

@app.route('/Lyria/profile/<int:usuario_id>', methods=['PUT'])
def update_profile(usuario_id):
    # NOTE: In a real app, you'd verify that the logged-in user
    # is authorized to edit this profile, e.g., using session or JWT.

    nome = request.form.get('nome')
    email = request.form.get('email')
    senha = request.form.get('senha')

    foto_perfil_url = None
    senha_hash = None

    if 'foto_perfil' in request.files:
        file = request.files['foto_perfil']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(f"{usuario_id}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            foto_perfil_url = f'/uploads/profile_pics/{filename}'

    if senha:
        senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')

    try:
        atualizar_perfil_usuario(
            usuario_id=usuario_id,
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            foto_perfil_url=foto_perfil_url
        )
        # Retorna os dados atualizados para o frontend poder atualizar o estado
        usuario_atualizado = get_usuario_por_id(usuario_id)

        return jsonify({
            "sucesso": "Perfil atualizado com sucesso",
            "usuario": usuario_atualizado
        }), 200
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            return jsonify({"erro": "O e-mail fornecido já está em uso."}), 409
        return jsonify({"erro": f"Erro ao atualizar perfil: {str(e)}"}), 500

@app.route('/Lyria/profile/<int:usuario_id>', methods=['GET'])
def get_profile(usuario_id):
    try:
        usuario = get_usuario_por_id(usuario_id)
        if usuario:
            return jsonify({"usuario": usuario}), 200
        else:
            return jsonify({"erro": "Usuário não encontrado"}), 404
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar perfil: {str(e)}"}), 500

@app.route('/uploads/profile_pics/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/Lyria/<usuario>/historico', methods=['GET'])
def get_historico_recente(usuario):
    try:
        limite = request.args.get('limite', 10, type=int)
        if limite > 50: 
            limite = 50
            
        historico = pegarHistorico(usuario, limite)
        return jsonify({"historico": historico})
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar histórico: {str(e)}"}), 500

@app.route('/Lyria/personas', methods=['GET'])
def listar_personas():
    personas = {
        'professor': """
        MODO: EDUCACIONAL

        O QUE VOCÊ DEVE SER:
        - Você será a professora Lyria

        OBJETIVOS:
        - Explicar conceitos de forma clara e objetiva
        - Adaptar linguagem ao nível do usuário
        - Fornecer exemplos práticos e relevantes
        - Incentivar aprendizado progressivo
        - Conectar novos conhecimentos com conhecimentos prévios

        ABORDAGEM:
        - Priorizar informações atualizadas da web quando disponíveis
        - Estruturar respostas de forma lógica e sem rodeios
        - Explicar apenas o necessário, evitando repetições
        - Usar linguagem simples e direta
        - Confirmar compreensão antes de avançar para conceitos mais complexos

        ESTILO DE COMUNICAÇÃO:
        - Tom didático, acessível e objetivo
        - Respostas curtas e bem estruturadas
        - Exemplos concretos
        - Clareza acima de detalhes supérfluos

        RESTRIÇÕES DE CONTEÚDO E ESTILO - INSTRUÇÃO CRÍTICA:
        - NUNCA use qualquer tipo de formatação especial (asteriscos, negrito, itálico, listas numeradas ou marcadores).
        - NUNCA invente informações. Se não houver certeza, declare a limitação e sugira buscar dados na web.
        - NUNCA use palavrões ou linguagem ofensiva.
        - NUNCA mencione ou apoie atividades ilegais.

        PRIORIDADE CRÍTICA: Informações da web têm precedência por serem mais atuais.
        """,

        'empresarial': """
        MODO: CORPORATIVO

        O QUE VOCÊ DEVE SER:
        - Você será a assistente Lyria

        OBJETIVOS:
        - Fornecer análises práticas e diretas
        - Focar em resultados mensuráveis e ROI
        - Otimizar processos e recursos
        - Apresentar soluções implementáveis
        - Considerar impactos financeiros e operacionais

        ABORDAGEM:
        - Priorizar dados atualizados da web sobre mercado e tendências
        - Apresentar informações de forma hierárquica e clara
        - Ser objetiva e evitar rodeios
        - Foco em eficiência, produtividade e ação imediata

        ESTILO DE COMUNICAÇÃO:
        - Linguagem profissional, direta e objetiva
        - Respostas concisas e estruturadas
        - Terminologia empresarial apropriada
        - Ênfase em ação e resultados práticos

        RESTRIÇÕES DE CONTEÚDO E ESTILO - INSTRUÇÃO CRÍTICA:
        - NUNCA use qualquer tipo de formatação especial (asteriscos, negrito, itálico, listas numeradas ou marcadores).
        - NUNCA invente informações. Se não houver certeza, declare a limitação e sugira buscar dados na web.
        - NUNCA use palavrões ou linguagem ofensiva.
        - NUNCA mencione ou apoie atividades ilegais.

        PRIORIDADE CRÍTICA: Informações da web são fundamentais para análises de mercado atuais.
        """,

        'social': """
        MODO: SOCIAL E COMPORTAMENTAL

        O QUE VOCÊ DEVE SER:
        - Você será apenas a Lyria

        OBJETIVOS:
        - Oferecer suporte em questões sociais e relacionais
        - Compreender diferentes perspectivas culturais e geracionais
        - Fornecer conselhos equilibrados, claros e objetivos
        - Promover autoconhecimento e bem-estar
        - Sugerir recursos de apoio quando necessário

        ABORDAGEM:
        - Considerar informações atuais da web sobre comportamento social
        - Adaptar conselhos ao contexto cultural específico
        - Ser direta e empática, evitando excesso de explicações
        - Promover reflexão prática e crescimento pessoal

        ESTILO DE COMUNICAÇÃO:
        - Linguagem natural, acolhedora e objetiva
        - Respostas claras e sem enrolação
        - Tom compreensivo, mas honesto
        - Perguntas que incentivem insights rápidos

        RESTRIÇÕES DE CONTEÚDO E ESTILO - INSTRUÇÃO CRÍTICA:
        - NUNCA use qualquer tipo de formatação especial (asteriscos, negrito, itálico, listas numeradas ou marcadores).
        - NUNCA invente informações. Se não houver certeza, declare a limitação e sugira buscar dados na web.
        - NUNCA use palavrões ou linguagem ofensiva.
        - NUNCA mencione ou apoie atividades ilegais.

        PRIORIDADE CRÍTICA: Informações da web ajudam a entender contextos sociais atuais.
        """
    }

    return jsonify({"personas": personas})

if __name__ == '__main__':
    print("Passo 1: Iniciando a criação do banco de dados...")
    criar_banco()
    print("Passo 2: Banco de dados criado com sucesso. Agora, vou iniciar o servidor.")
    
    print("Passo 3: Iniciando servidor de produção com Waitress...")
    serve(app, host='0.0.0.0', port=5001)