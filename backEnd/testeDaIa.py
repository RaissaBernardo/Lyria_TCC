import requests
import sqlite3
import os
from classificadorDaWeb.classificador_busca_web import deve_buscar_na_web
from banco.banco import (
    carregar_conversas,
    salvarMensagem,
    escolherApersona,
    criarUsuario,
    criar_banco
)
import json
import time

def verificar_configuracao():
    print("=== DEBUG: VERIFICANDO CONFIGURAÇÃO ===")
    
    groq_key = os.getenv("GROQ_API_KEY")
    hf_key = os.getenv("HUGGING_FACE_API_KEY")
    serp_key = os.getenv("KEY_SERP_API")
    
    print(f"GROQ_API_KEY: {'✓ Encontrada (' + groq_key[:10] + '...)' if groq_key else '✗ NÃO ENCONTRADA'}")
    print(f"HUGGING_FACE_API_KEY: {'✓ Encontrada (' + hf_key[:10] + '...)' if hf_key else '✗ NÃO ENCONTRADA'}")
    print(f"KEY_SERP_API: {'✓ Encontrada (' + serp_key[:10] + '...)' if serp_key else '✗ NÃO ENCONTRADA'}")
    
    if not groq_key and not hf_key:
        print("\n🚨 PROBLEMA: Nenhuma API de IA configurada!")
        print("Siga os passos:")
        print("1. Crie conta em https://console.groq.com")
        print("2. Gere API Key")
        print("3. Execute: export GROQ_API_KEY='sua_chave'")
        print("4. Reinicie o programa")
        return False
    
    return True

def testar_groq_api():
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("❌ GROQ: Chave não configurada")
        return False
        
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messages": [{"role": "user", "content": "Teste"}],
        "model": "llama3-8b-8192",
        "max_tokens": 50,
        "temperature": 0.7
    }
    
    try:
        print("🧪 GROQ: Testando conexão...")
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        
        print(f"🧪 GROQ: Status HTTP {resp.status_code}")
        
        if resp.status_code == 401:
            print("❌ GROQ: API Key inválida")
            return False
        elif resp.status_code == 429:
            print("❌ GROQ: Rate limit atingido")
            return False
        elif resp.status_code != 200:
            print(f"❌ GROQ: Erro HTTP {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        resposta = data['choices'][0]['message']['content']
        print(f"✅ GROQ: Funcionando! Resposta teste: {resposta[:50]}...")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ GROQ: Timeout na conexão")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ GROQ: Erro de conexão")
        return False
    except Exception as e:
        print(f"❌ GROQ: Erro inesperado: {e}")
        return False

def testar_hf_api():
    hf_key = os.getenv("HUGGING_FACE_API_KEY")
    if not hf_key:
        print("❌ HF: Chave não configurada")
        return False
        
    headers = {
        "Authorization": f"Bearer {hf_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": "Teste",
        "parameters": {"max_new_tokens": 20, "temperature": 0.7},
        "options": {"wait_for_model": True}
    }
    
    try:
        print("🧪 HF: Testando conexão...")
        resp = requests.post("https://router.huggingface.co/hf-inference/models/distilgpt2", headers=headers, json=payload, timeout=15)
        
        print(f"🧪 HF: Status HTTP {resp.status_code}")
        
        if resp.status_code == 401:
            print("❌ HF: API Key inválida")
            return False
        elif resp.status_code == 503:
            print("⚠️ HF: Modelo carregando (normal)")
            return True  
        elif resp.status_code == 429:
            print("❌ HF: Rate limit atingido")
            return False
        elif resp.status_code != 200:
            print(f"❌ HF: Erro HTTP {resp.status_code}: {resp.text}")
            return False
            
        data = resp.json()
        print(f"✅ HF: Funcionando! Resposta: {str(data)[:100]}...")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ HF: Timeout (comum nesta API)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ HF: Erro de conexão")
        return False
    except Exception as e:
        print(f"❌ HF: Erro inesperado: {e}")
        return False

import requests
import os

def chamar_groq_api(prompt, max_tokens=400):
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("❌ GROQ: Chave não encontrada")
        return None

    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": "llama-3.1-8b-instant",
        "max_tokens": max_tokens,
        "temperature": 0.3
    }

    try:
        print(f"🚀 GROQ: Enviando prompt ({len(prompt)} chars)...")
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        print(f"📥 GROQ: Status HTTP {resp.status_code}")
        if resp.status_code != 200:
            print(f"❌ GROQ: Erro {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        resposta = data['choices'][0]['message']['content']
        print(f"✅ GROQ: Sucesso! ({len(resposta)} chars)")
        return resposta

    except Exception as e:
        print(f"❌ GROQ: Exceção: {e}")
        return None


# --- CHAMAR HUGGING FACE INFERENCE API ---
def chamar_hf_inference(prompt, max_new_tokens=400, temperature=0.3):
    hf_key = os.getenv("HUGGING_FACE_API_KEY")
    if not hf_key:
        print("❌ HF: Chave não encontrada, usando Groq...")
        return chamar_groq_api(prompt) or gerar_resposta_offline(prompt)

    headers = {
        "Authorization": f"Bearer {hf_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt[:2000], 
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "return_full_text": False
        },
        "options": {"wait_for_model": True}
    }

    try:
        print(f"🚀 HF: Enviando prompt ({len(prompt)} chars)...")
        resp = requests.post(
            "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
            headers=headers,
            json=payload,
            timeout=60
        )

        print(f"📥 HF: Status HTTP {resp.status_code}")
        data = resp.json()
        print("DEBUG HF JSON:", data)

        if resp.status_code == 503:
            print("⚠️ HF: Modelo carregando, usando fallback...")
            return chamar_groq_api(prompt) or gerar_resposta_offline(prompt)

        if resp.status_code != 200:
            print(f"❌ HF: Erro {resp.status_code}, usando fallback...")
            return chamar_groq_api(prompt) or gerar_resposta_offline(prompt)

        if isinstance(data, list) and len(data) > 0 and 'generated_text' in data[0]:
            resposta = data[0]['generated_text'].strip()
            print(f"✅ HF: Sucesso! ({len(resposta)} chars)")
            return resposta

        print("❌ HF: Formato inesperado, usando fallback...")
        return chamar_groq_api(prompt) or gerar_resposta_offline(prompt)

    except Exception as e:
        print(f"❌ HF: Exceção: {e}, usando fallback...")
        return chamar_groq_api(prompt) or gerar_resposta_offline(prompt)

def gerar_resposta_offline(prompt):
    """Resposta de emergência melhorada"""
    print("🔄 Gerando resposta offline...")
    
    if "Usuário:" in prompt:
        pergunta = prompt.split("Usuário:")[-1].split("Lyria:")[0].strip()
    else:
        pergunta = prompt.strip()
    
    pergunta_lower = pergunta.lower()
    
    if any(word in pergunta_lower for word in ["como", "fazer", "tutorial"]):
        return "Para isso, você pode começar com alguns passos básicos. Me dê mais detalhes e posso orientar melhor."
    
    if any(word in pergunta_lower for word in ["o que é", "definir", "conceito"]):
        return "Esse é um tema interessante. Posso explicar de forma clara se você especificar o que quer saber."
    
    if any(word in pergunta_lower for word in ["por que", "porque", "razão"]):
        return "Há várias razões para isso. Quer que eu explique algum aspecto específico?"
    
    if any(word in pergunta_lower for word in ["onde", "local", "lugar"]):
        return "A localização específica depende do contexto. Pode dar mais detalhes?"
    
    if any(word in pergunta_lower for word in ["quando", "tempo", "data"]):
        return "O timing varia conforme a situação. Precisa de informações sobre um período específico?"
    
    return f"Entendi sua pergunta sobre '{pergunta[:50]}...' mas estou com problemas técnicos. Pode tentar reformular ou aguardar alguns minutos?"

SERPAPI_KEY = os.getenv("KEY_SERP_API")
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def carregar_memorias(usuario):
    from banco.banco import carregar_memorias as carregar_memorias_db
    return carregar_memorias_db(usuario)

def perguntar_ollama(pergunta, conversas, memorias, persona, contexto_web=None):
    print(f"\n🤖 Processando pergunta: {pergunta[:50]}...")
    
    if 'professor' in persona.lower():
        intro = """
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
        """
    elif 'empresarial' in persona.lower():
        intro = """
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
        """
    else:
        intro = """
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
    
    prompt_parts = [intro]
    
    if conversas and len(conversas) > 0:
        prompt_parts.append("\n\n=== HISTÓRICO DA CONVERSA ===")
        ultimas_conversas = conversas[-10:] if len(conversas) > 10 else conversas
        
        for i, conv in enumerate(ultimas_conversas, 1):
            pergunta_anterior = conv.get('pergunta', '')[:300] 
            resposta_anterior = conv.get('resposta', '')[:300]  
            
            prompt_parts.append(f"\n[Conversa {i}]")
            prompt_parts.append(f"\nUsuário: {pergunta_anterior}")
            prompt_parts.append(f"\nLyria: {resposta_anterior}")
        
        prompt_parts.append("\n=== FIM DO HISTÓRICO ===\n")
        print(f"📚 Incluídas {len(ultimas_conversas)} conversas anteriores no contexto")
    
    if memorias and len(memorias) > 0:
        prompt_parts.append("\n=== MEMÓRIAS RELEVANTES ===")
        ultimas_memorias = memorias[-10:] if len(memorias) > 10 else memorias
        
        for memoria in ultimas_memorias:
            if len(memoria) > 10:  
                prompt_parts.append(f"\n{memoria[:200]}") 
        
        prompt_parts.append("\n=== FIM DAS MEMÓRIAS ===\n")
        print(f"🧠 Incluídas {len(ultimas_memorias)} memórias no contexto")
    
    if contexto_web:
        prompt_parts.append(f"\n=== INFORMAÇÃO ATUALIZADA DA WEB ===")
        prompt_parts.append(f"\n{contexto_web[:400]}")  
        prompt_parts.append(f"\n=== FIM DA INFORMAÇÃO DA WEB ===\n")
        print(f"🌐 Contexto web incluído ({len(contexto_web)} caracteres)")
    
    prompt_parts.append(f"\n\n=== PERGUNTA ATUAL ===")
    prompt_parts.append(f"\nUsuário: {pergunta}")
    prompt_parts.append("\n\nLyria:")
    
    prompt_final = "".join(prompt_parts)
    
    print(f"📝 Prompt final: {len(prompt_final)} caracteres")
    print(f"   - Conversas: {len(conversas) if conversas else 0}")
    print(f"   - Memórias: {len(memorias) if memorias else 0}")
    print(f"   - Web: {'Sim' if contexto_web else 'Não'}")
    
    resposta = chamar_hf_inference(prompt_final, max_new_tokens=600)
    print(f"💬 Resposta gerada: {len(resposta) if resposta else 0} caracteres")
    
    return resposta

def verificar_ollama_status():
    groq_ok = bool(os.getenv("GROQ_API_KEY"))
    hf_ok = bool(os.getenv("HUGGING_FACE_API_KEY"))
    
    if groq_ok and hf_ok:
        return {'status': 'info', 'detalhes': 'Groq + HF Inference APIs configuradas'}
    elif groq_ok:
        return {'status': 'info', 'detalhes': 'Apenas Groq API configurada (recomendado)'}
    elif hf_ok:
        return {'status': 'info', 'detalhes': 'Apenas HF Inference API configurada'}
    else:
        return {'status': 'warning', 'detalhes': 'Nenhuma API configurada - modo offline'}

def buscar_na_web(pergunta):
    try:
        params = {"q": pergunta, "hl": "pt-br", "gl": "br", "api_key": SERPAPI_KEY}
        res = requests.get("https://serpapi.com/search", params=params, timeout=10)
        res.raise_for_status()
        
        resultados = res.json().get("organic_results", [])
        trechos = [r.get("snippet", "") for r in resultados[:2] if r.get("snippet")]
        return " ".join(trechos) if trechos else None
        
    except Exception as e:
        return None

def get_persona_texto(persona_tipo):
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
    return personas.get(persona_tipo, personas['professor'])

if __name__ == "__main__":
    print("=== LYRIA BOT - VERSÃO DEBUG ===\n")
    
    # Verificação inicial
    if not verificar_configuracao():
        exit(1)
    
    # Teste das APIs
    print("\n=== TESTANDO APIS ===")
    groq_ok = testar_groq_api()
    hf_ok = testar_hf_api()
    
    if not groq_ok and not hf_ok:
        print("\n🚨 NENHUMA API FUNCIONANDO!")
        print("Continuando em modo offline limitado...")
    
    criar_banco()

    print("\nDo que você precisa?")
    print("1. Professor")
    print("2. Empresarial") 
    print("3. Social")
    escolha = input("Escolha (1-3): ").strip()

    persona_map = {'1': 'professor', '2': 'empresarial', '3': 'social'}
    persona_tipo = persona_map.get(escolha, 'professor')

    usuario = input("Informe seu nome: ").strip().lower()

    try:
        criarUsuario(usuario, f"{usuario}@local.com", persona_tipo)
        print(f"✅ Usuário {usuario} criado com persona {persona_tipo}")
    except:
        escolherApersona(persona_tipo, usuario)
        print(f"✅ Persona {persona_tipo} atualizada para {usuario}")

    persona = get_persona_texto(persona_tipo)
    status = verificar_ollama_status()
    print(f"\n{status['detalhes']}")
    print("\n=== CHAT INICIADO (digite 'sair' para encerrar) ===")
    
    while True:
        entrada = input("\nVocê: ").strip()
        if entrada.lower() == 'sair':
            break

        contexto_web = None
        if deve_buscar_na_web(entrada):
            print("🌐 Buscando informações na web...")
            contexto_web = buscar_na_web(entrada)

        resposta = perguntar_ollama(
            entrada,
            carregar_conversas(usuario),
            carregar_memorias(usuario),
            persona,
            contexto_web
        )

        print(f"\nLyria: {resposta}")
        salvarMensagem(usuario, entrada, resposta, modelo_usado="api", tokens=None)