--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-07-09 03:46:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 24799)
-- Name: alertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alertas (
    id integer NOT NULL,
    usuario_id integer,
    tipo character varying(50) NOT NULL,
    descricao text,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    status character varying(20) DEFAULT 'novo'::character varying,
    unidade_atendente_id integer,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    policial_atribuido_id integer,
    unidade_atribuida_id integer
);


ALTER TABLE public.alertas OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16801)
-- Name: alertas_historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alertas_historico (
    id integer NOT NULL,
    alerta_id integer NOT NULL,
    usuario_id integer,
    status_anterior character varying(50) NOT NULL,
    status_novo character varying(50) NOT NULL,
    observacao text,
    data_registro timestamp without time zone DEFAULT now()
);


ALTER TABLE public.alertas_historico OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16800)
-- Name: alertas_historico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alertas_historico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alertas_historico_id_seq OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 233
-- Name: alertas_historico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alertas_historico_id_seq OWNED BY public.alertas_historico.id;


--
-- TOC entry 239 (class 1259 OID 24798)
-- Name: alertas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alertas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alertas_id_seq OWNER TO postgres;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 239
-- Name: alertas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alertas_id_seq OWNED BY public.alertas.id;


--
-- TOC entry 226 (class 1259 OID 16712)
-- Name: arquivos_midia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arquivos_midia (
    id integer NOT NULL,
    nome_arquivo character varying(255) NOT NULL,
    caminho_arquivo character varying(255) NOT NULL,
    tipo_arquivo character varying(50) NOT NULL,
    tamanho_arquivo integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    criado_por integer NOT NULL
);


ALTER TABLE public.arquivos_midia OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16711)
-- Name: arquivos_midia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arquivos_midia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.arquivos_midia_id_seq OWNER TO postgres;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 225
-- Name: arquivos_midia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arquivos_midia_id_seq OWNED BY public.arquivos_midia.id;


--
-- TOC entry 222 (class 1259 OID 16681)
-- Name: cameras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cameras (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    localizacao character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'ativo'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cameras OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16680)
-- Name: cameras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cameras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cameras_id_seq OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 221
-- Name: cameras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cameras_id_seq OWNED BY public.cameras.id;


--
-- TOC entry 230 (class 1259 OID 16761)
-- Name: escalonamento_alertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.escalonamento_alertas (
    id integer NOT NULL,
    alerta_id integer,
    unidade_anterior integer,
    unidade_atual integer,
    tempo_escalonamento integer,
    motivo character varying(100),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.escalonamento_alertas OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16760)
-- Name: escalonamento_alertas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.escalonamento_alertas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escalonamento_alertas_id_seq OWNER TO postgres;

--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 229
-- Name: escalonamento_alertas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.escalonamento_alertas_id_seq OWNED BY public.escalonamento_alertas.id;


--
-- TOC entry 242 (class 1259 OID 24839)
-- Name: logs_alertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_alertas (
    id integer NOT NULL,
    alerta_id integer NOT NULL,
    policial_id integer NOT NULL,
    policial_nome character varying(100) NOT NULL,
    acao character varying(20) NOT NULL,
    data_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    policial_nip character varying(30),
    policial_bi character varying(30)
);


ALTER TABLE public.logs_alertas OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 24838)
-- Name: logs_alertas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_alertas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_alertas_id_seq OWNER TO postgres;

--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 241
-- Name: logs_alertas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_alertas_id_seq OWNED BY public.logs_alertas.id;


--
-- TOC entry 232 (class 1259 OID 16784)
-- Name: logs_auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_auditoria (
    id integer NOT NULL,
    usuario_id integer,
    acao character varying(50) NOT NULL,
    tabela character varying(50) NOT NULL,
    registro_id integer,
    dados_anteriores jsonb,
    dados_novos jsonb,
    ip_address character varying(45),
    user_agent text,
    criado_em timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_auditoria OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16783)
-- Name: logs_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_auditoria_id_seq OWNER TO postgres;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 231
-- Name: logs_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_auditoria_id_seq OWNED BY public.logs_auditoria.id;


--
-- TOC entry 228 (class 1259 OID 16736)
-- Name: logs_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_sistema (
    id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    descricao text NOT NULL,
    usuario_id integer,
    alerta_id integer,
    unidade_id integer,
    dados_adicional jsonb,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_sistema OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16735)
-- Name: logs_sistema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_sistema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_sistema_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 227
-- Name: logs_sistema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_sistema_id_seq OWNED BY public.logs_sistema.id;


--
-- TOC entry 224 (class 1259 OID 16691)
-- Name: mensagens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensagens (
    id integer NOT NULL,
    remetente_id integer NOT NULL,
    destinatario_id integer NOT NULL,
    conteudo text NOT NULL,
    media_url character varying(255),
    lida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mensagens OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16690)
-- Name: mensagens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensagens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensagens_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 223
-- Name: mensagens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mensagens_id_seq OWNED BY public.mensagens.id;


--
-- TOC entry 220 (class 1259 OID 16435)
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacoes (
    id integer NOT NULL,
    usuario_id integer,
    tipo character varying(20) NOT NULL,
    titulo character varying(200) NOT NULL,
    mensagem text NOT NULL,
    dados jsonb,
    lida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notificacoes OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16434)
-- Name: notificacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacoes_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 219
-- Name: notificacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacoes_id_seq OWNED BY public.notificacoes.id;


--
-- TOC entry 218 (class 1259 OID 16414)
-- Name: sessoes_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessoes_usuario (
    id integer NOT NULL,
    user_id integer,
    token_hash character varying(200),
    ip_address character varying(50),
    expira_em timestamp without time zone,
    ativo boolean DEFAULT true
);


ALTER TABLE public.sessoes_usuario OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16413)
-- Name: sessoes_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessoes_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessoes_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 217
-- Name: sessoes_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessoes_usuario_id_seq OWNED BY public.sessoes_usuario.id;


--
-- TOC entry 238 (class 1259 OID 24785)
-- Name: unidades_policiais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidades_policiais (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    codigo_unidade character varying(20) NOT NULL,
    endereco text NOT NULL,
    localizacao_lat numeric(10,8),
    localizacao_lng numeric(11,8),
    telefone character varying(20),
    ativa boolean DEFAULT true,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.unidades_policiais OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24783)
-- Name: unidades_policiais_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unidades_policiais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unidades_policiais_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 237
-- Name: unidades_policiais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unidades_policiais_id_seq OWNED BY public.unidades_policiais.id;


--
-- TOC entry 236 (class 1259 OID 24719)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome_completo character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(100) NOT NULL,
    tipo_usuario character varying(20) NOT NULL,
    telefone character varying(20),
    bilhete_identidade character varying(50),
    nip character varying(50),
    ativo boolean DEFAULT true,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rua character varying(100),
    municipio character varying(100),
    bairro character varying(100),
    numero_casa character varying(20),
    localizacao_lat numeric(10,8),
    localizacao_lng numeric(11,8),
    endereco text,
    contacto_familiar character varying(100),
    ultima_atualizacao timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24718)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 235
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4786 (class 2604 OID 24802)
-- Name: alertas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas ALTER COLUMN id SET DEFAULT nextval('public.alertas_id_seq'::regclass);


--
-- TOC entry 4776 (class 2604 OID 16804)
-- Name: alertas_historico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas_historico ALTER COLUMN id SET DEFAULT nextval('public.alertas_historico_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 16715)
-- Name: arquivos_midia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arquivos_midia ALTER COLUMN id SET DEFAULT nextval('public.arquivos_midia_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 16684)
-- Name: cameras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cameras ALTER COLUMN id SET DEFAULT nextval('public.cameras_id_seq'::regclass);


--
-- TOC entry 4772 (class 2604 OID 16764)
-- Name: escalonamento_alertas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalonamento_alertas ALTER COLUMN id SET DEFAULT nextval('public.escalonamento_alertas_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24842)
-- Name: logs_alertas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_alertas ALTER COLUMN id SET DEFAULT nextval('public.logs_alertas_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 16787)
-- Name: logs_auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_auditoria ALTER COLUMN id SET DEFAULT nextval('public.logs_auditoria_id_seq'::regclass);


--
-- TOC entry 4770 (class 2604 OID 16739)
-- Name: logs_sistema id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_sistema ALTER COLUMN id SET DEFAULT nextval('public.logs_sistema_id_seq'::regclass);


--
-- TOC entry 4765 (class 2604 OID 16694)
-- Name: mensagens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens ALTER COLUMN id SET DEFAULT nextval('public.mensagens_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 16438)
-- Name: notificacoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes ALTER COLUMN id SET DEFAULT nextval('public.notificacoes_id_seq'::regclass);


--
-- TOC entry 4755 (class 2604 OID 16417)
-- Name: sessoes_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessoes_usuario ALTER COLUMN id SET DEFAULT nextval('public.sessoes_usuario_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 24788)
-- Name: unidades_policiais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_policiais ALTER COLUMN id SET DEFAULT nextval('public.unidades_policiais_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 24722)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5011 (class 0 OID 24799)
-- Dependencies: 240
-- Data for Name: alertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alertas (id, usuario_id, tipo, descricao, latitude, longitude, status, unidade_atendente_id, criado_em, atualizado_em, created_at, updated_at, policial_atribuido_id, unidade_atribuida_id) FROM stdin;
117	24	alerta	Alerta de emergência	-8.86638470	13.30720670	resolvido	\N	2025-07-04 12:26:41.798638	2025-07-04 12:27:24.933914	2025-07-04 12:26:41.798638	2025-07-04 12:26:41.798638	\N	49
121	24	alerta	Alerta de emergência	-8.86638470	13.30720670	resolvido	\N	2025-07-04 12:28:21.394888	2025-07-04 12:34:10.122411	2025-07-04 12:28:21.394888	2025-07-04 12:28:21.394888	\N	49
119	24	alerta	Alerta de emergência	-8.86638470	13.30720670	resolvido	\N	2025-07-04 12:27:38.992352	2025-07-04 12:34:11.707618	2025-07-04 12:27:38.992352	2025-07-04 12:27:38.992352	\N	49
123	24	alerta	Alerta de emergência	-8.86636860	13.30700260	resolvido	\N	2025-07-04 12:36:37.4176	2025-07-04 12:40:35.090222	2025-07-04 12:36:37.4176	2025-07-04 12:36:37.4176	\N	49
4	20	alerta	Alerta de emergência	-8.86635010	13.30707570	expirado	\N	2025-06-17 04:42:06.583536	2025-06-17 04:42:06.583536	2025-06-17 04:42:06.583536	2025-06-18 23:00:00.032912	\N	\N
5	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:52:09.310538	2025-06-17 04:52:09.310538	2025-06-17 04:52:09.310538	2025-06-18 23:00:00.032912	\N	\N
6	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:52:54.900012	2025-06-17 04:52:54.900012	2025-06-17 04:52:54.900012	2025-06-18 23:00:00.032912	\N	\N
7	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:55:05.407773	2025-06-17 04:55:05.407773	2025-06-17 04:55:05.407773	2025-06-18 23:00:00.032912	\N	\N
8	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:55:21.11195	2025-06-17 04:55:21.11195	2025-06-17 04:55:21.11195	2025-06-18 23:00:00.032912	\N	\N
9	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:57:18.501848	2025-06-17 04:57:18.501848	2025-06-17 04:57:18.501848	2025-06-18 23:00:00.032912	\N	\N
10	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:57:35.86413	2025-06-17 04:57:35.86413	2025-06-17 04:57:35.86413	2025-06-18 23:00:00.032912	\N	\N
11	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:59:24.106894	2025-06-17 04:59:24.106894	2025-06-17 04:59:24.106894	2025-06-18 23:00:00.032912	\N	\N
12	20	alerta	Alerta de emergência	-8.86634910	13.30710430	expirado	\N	2025-06-17 04:59:29.126432	2025-06-17 04:59:29.126432	2025-06-17 04:59:29.126432	2025-06-18 23:00:00.032912	\N	\N
13	20	alerta	Alerta de emergência	-8.86631580	13.30708300	expirado	\N	2025-06-17 05:09:45.910453	2025-06-17 05:09:45.910453	2025-06-17 05:09:45.910453	2025-06-18 23:00:00.032912	\N	\N
20	20	alerta	Alerta de emergência	-8.86631170	13.30697040	resolvido	\N	2025-06-19 00:00:19.746391	2025-06-19 00:05:05.854502	2025-06-19 00:00:19.746391	2025-06-19 00:00:19.746391	\N	\N
19	20	alerta	Alerta de emergência	-8.86631170	13.30697040	fechado	\N	2025-06-18 23:59:21.42327	2025-06-19 00:05:09.93166	2025-06-18 23:59:21.42327	2025-06-18 23:59:21.42327	\N	\N
18	20	alerta	Alerta de emergência	-8.86638920	13.30722930	resolvido	\N	2025-06-18 23:51:29.782437	2025-06-19 00:05:12.539955	2025-06-18 23:51:29.782437	2025-06-18 23:51:29.782437	\N	\N
17	20	alerta	Alerta de emergência	-8.86639650	13.30722930	resolvido	\N	2025-06-18 23:42:19.91493	2025-06-19 00:05:15.380182	2025-06-18 23:42:19.91493	2025-06-18 23:42:19.91493	\N	\N
16	20	alerta	Alerta de emergência	-8.86635330	13.30704600	resolvido	\N	2025-06-18 23:37:20.188577	2025-06-19 00:05:18.214077	2025-06-18 23:37:20.188577	2025-06-18 23:37:20.188577	\N	\N
15	20	alerta	Alerta de emergência	-8.86633810	13.30700610	resolvido	\N	2025-06-18 23:16:34.182708	2025-06-19 00:05:20.791527	2025-06-18 23:16:34.182708	2025-06-18 23:16:34.182708	\N	\N
14	20	alerta	Alerta de emergência	-8.86633810	13.30700610	resolvido	\N	2025-06-18 23:15:36.508366	2025-06-19 00:05:23.069998	2025-06-18 23:15:36.508366	2025-06-18 23:15:36.508366	\N	\N
24	20	alerta	Alerta de emergência	-8.86633240	13.30699330	resolvido	\N	2025-06-19 01:48:45.464179	2025-06-19 02:12:22.618687	2025-06-19 01:48:45.464179	2025-06-19 01:48:45.464179	\N	\N
23	20	alerta	Alerta de emergência	-8.86633040	13.30704670	resolvido	\N	2025-06-19 01:08:32.268284	2025-06-19 02:12:27.748074	2025-06-19 01:08:32.268284	2025-06-19 01:08:32.268284	\N	\N
22	20	alerta	Alerta de emergência	-8.86633790	13.30701080	resolvido	\N	2025-06-19 01:04:27.660422	2025-06-19 02:12:39.464356	2025-06-19 01:04:27.660422	2025-06-19 01:04:27.660422	\N	\N
21	20	alerta	Alerta de emergência	-8.86636300	13.30721750	resolvido	\N	2025-06-19 00:05:40.73079	2025-06-19 02:12:42.847437	2025-06-19 00:05:40.73079	2025-06-19 00:05:40.73079	\N	\N
25	20	alerta	Alerta de emergência	-8.86632790	13.30699590	resolvido	\N	2025-06-19 02:12:30.460239	2025-06-19 02:12:46.455194	2025-06-19 02:12:30.460239	2025-06-19 02:12:30.460239	\N	\N
26	20	alerta	Alerta de emergência	-8.86632790	13.30699590	resolvido	\N	2025-06-19 02:12:50.717269	2025-06-19 05:10:42.095158	2025-06-19 02:12:50.717269	2025-06-19 02:12:50.717269	\N	\N
28	20	alerta	Alerta de emergência	-8.86633630	13.30699580	resolvido	\N	2025-06-19 03:52:21.833948	2025-06-19 05:48:03.196605	2025-06-19 03:52:21.833948	2025-06-19 03:52:21.833948	\N	\N
27	20	alerta	Alerta de emergência	-8.86633630	13.30699580	resolvido	\N	2025-06-19 03:20:22.269578	2025-06-19 05:48:49.133237	2025-06-19 03:20:22.269578	2025-06-19 03:20:22.269578	\N	\N
29	20	alerta	Alerta de emergência	-8.86639270	13.30723100	resolvido	\N	2025-06-19 05:47:36.850425	2025-06-19 05:51:26.095877	2025-06-19 05:47:36.850425	2025-06-19 05:47:36.850425	\N	\N
30	20	alerta	Alerta de emergência	-8.86630460	13.30703740	resolvido	\N	2025-06-19 05:51:21.743282	2025-06-19 05:55:23.627984	2025-06-19 05:51:21.743282	2025-06-19 05:51:21.743282	\N	\N
31	20	alerta	Alerta de emergência	-8.86634280	13.30704570	fechado	\N	2025-06-19 05:55:09.700194	2025-06-19 05:59:09.718059	2025-06-19 05:55:09.700194	2025-06-19 05:55:09.700194	\N	\N
32	20	alerta	Alerta de emergência	-8.86633830	13.30699680	resolvido	\N	2025-06-19 05:59:56.019329	2025-06-19 06:15:37.763433	2025-06-19 05:59:56.019329	2025-06-19 05:59:56.019329	\N	\N
33	24	alerta	Alerta de emergência	-8.86638160	13.30722710	resolvido	\N	2025-06-19 06:14:32.656099	2025-06-19 07:28:48.310271	2025-06-19 06:14:32.656099	2025-06-19 06:14:32.656099	\N	\N
34	20	alerta	Alerta de emergência	-8.86639070	13.30724760	fechado	\N	2025-06-19 07:28:32.750886	2025-06-19 07:32:23.071279	2025-06-19 07:28:32.750886	2025-06-19 07:28:32.750886	\N	12
35	24	alerta	Alerta de emergência	-8.86638710	13.30722840	resolvido	\N	2025-06-19 07:32:14.603239	2025-06-19 07:38:28.917717	2025-06-19 07:32:14.603239	2025-06-19 07:32:14.603239	\N	12
36	20	alerta	Alerta de emergência	-8.86635820	13.30721440	resolvido	\N	2025-06-19 07:38:15.606903	2025-06-19 07:49:28.386474	2025-06-19 07:38:15.606903	2025-06-19 07:38:15.606903	\N	12
37	24	alerta	Alerta de emergência	-8.86636240	13.30719890	resolvido	\N	2025-06-19 07:49:29.995711	2025-06-19 07:53:11.734935	2025-06-19 07:49:29.995711	2025-06-19 07:49:29.995711	\N	12
38	24	alerta	Alerta de emergência	-8.86638710	13.30722840	fechado	\N	2025-06-19 07:53:13.096923	2025-06-19 09:04:17.658287	2025-06-19 07:53:13.096923	2025-06-19 07:53:13.096923	\N	12
39	20	alerta	Alerta de emergência	-8.86633090	13.30699920	fechado	\N	2025-06-19 09:04:20.305924	2025-06-19 09:07:20.068959	2025-06-19 09:04:20.305924	2025-06-19 09:04:20.305924	\N	12
40	24	alerta	Alerta de emergência	-8.86636080	13.30721980	fechado	\N	2025-06-19 09:07:21.531708	2025-06-19 09:22:04.147194	2025-06-19 09:07:21.531708	2025-06-19 09:07:21.531708	\N	12
41	24	alerta	Alerta de emergência	-8.86636280	13.30722470	resolvido	\N	2025-06-19 09:22:17.82119	2025-06-19 09:58:09.343256	2025-06-19 09:22:17.82119	2025-06-19 09:22:17.82119	\N	12
42	24	alerta	Alerta de emergência	-8.86639180	13.30724850	fechado	\N	2025-06-19 09:58:12.316198	2025-06-19 13:03:52.502207	2025-06-19 09:58:12.316198	2025-06-19 09:58:12.316198	\N	10
51	24	alerta	Alerta de emergência	-8.86634340	13.30708040	resolvido	\N	2025-07-01 12:44:25.578735	2025-07-01 14:15:57.301982	2025-07-01 12:44:25.578735	2025-07-01 12:44:25.578735	\N	49
43	24	alerta	Alerta de emergência	-8.86634350	13.30704870	expirado	\N	2025-06-19 14:09:55.637321	2025-06-19 17:39:47.249856	2025-06-19 14:09:55.637321	2025-06-23 13:00:00.42846	22	12
44	24	alerta	Alerta de emergência	-8.86516830	13.31090600	expirado	\N	2025-06-26 00:35:45.512946	2025-06-26 15:52:57.680883	2025-06-26 00:35:45.512946	2025-06-26 00:35:45.512946	\N	12
45	24	alerta	Alerta de emergência	-8.86708530	13.30874080	expirado	\N	2025-06-26 22:29:27.916853	2025-06-26 22:29:27.916853	2025-06-26 22:29:27.916853	2025-07-01 09:00:00.119435	\N	49
46	24	alerta	Alerta de emergência	-8.86708530	13.30874080	expirado	\N	2025-06-26 22:29:48.70618	2025-06-26 22:29:48.70618	2025-06-26 22:29:48.70618	2025-07-01 09:00:00.119435	\N	49
47	24	alerta	Alerta de emergência	-8.86708530	13.30874080	expirado	\N	2025-06-26 22:29:52.708101	2025-06-26 22:29:52.708101	2025-06-26 22:29:52.708101	2025-07-01 09:00:00.119435	\N	49
50	24	alerta	Alerta de emergência	-8.86634340	13.30708040	resolvido	\N	2025-07-01 12:39:27.632803	2025-07-01 14:15:59.957895	2025-07-01 12:39:27.632803	2025-07-01 12:39:27.632803	\N	49
49	24	alerta	Alerta de emergência	-8.86634340	13.30708040	resolvido	\N	2025-07-01 12:39:14.986725	2025-07-01 14:21:16.008984	2025-07-01 12:39:14.986725	2025-07-01 12:39:14.986725	\N	49
48	24	alerta	Alerta de emergência	-8.86629440	13.30702150	resolvido	\N	2025-07-01 10:04:02.74666	2025-07-01 16:10:19.071792	2025-07-01 10:04:02.74666	2025-07-01 10:04:02.74666	\N	49
85	24	alerta	Alerta de emergência	-8.86633270	13.30704360	resolvido	\N	2025-07-01 16:10:49.690332	2025-07-01 16:38:43.383428	2025-07-01 16:10:49.690332	2025-07-01 16:10:49.690332	22	49
86	24	alerta	Alerta de emergência	-8.86590180	13.30709490	resolvido	\N	2025-07-01 16:58:44.651131	2025-07-02 11:33:10.740867	2025-07-01 16:58:44.651131	2025-07-01 16:58:44.651131	22	49
84	24	alerta	Alerta de emergência	-8.86633270	13.30704360	resolvido	\N	2025-07-01 16:10:46.181067	2025-07-01 16:58:17.058399	2025-07-01 16:10:46.181067	2025-07-01 16:10:46.181067	22	49
107	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:47.0655	2025-07-04 12:27:12.552247	2025-07-04 12:18:47.0655	2025-07-04 12:18:47.0655	\N	49
87	24	alerta	Alerta de emergência	-8.86632360	13.30703690	expirado	\N	2025-07-02 11:39:46.683242	2025-07-02 11:41:11.038931	2025-07-02 11:39:46.683242	2025-07-03 19:00:00.103413	22	49
88	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:09:01.752253	2025-07-02 13:09:01.752253	2025-07-02 13:09:01.752253	2025-07-03 19:00:00.103413	\N	49
89	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:13:10.283481	2025-07-02 13:13:10.283481	2025-07-02 13:13:10.283481	2025-07-03 19:00:00.103413	\N	49
90	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:14:01.657758	2025-07-02 13:14:01.657758	2025-07-02 13:14:01.657758	2025-07-03 19:00:00.103413	\N	49
91	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:52:51.771809	2025-07-02 13:52:51.771809	2025-07-02 13:52:51.771809	2025-07-03 19:00:00.103413	\N	49
92	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:53:46.556304	2025-07-02 13:53:46.556304	2025-07-02 13:53:46.556304	2025-07-03 19:00:00.103413	\N	49
93	24	alerta	Alerta de emergência	-8.86642370	13.30706080	expirado	\N	2025-07-02 13:54:01.18614	2025-07-02 13:54:01.18614	2025-07-02 13:54:01.18614	2025-07-03 19:00:00.103413	\N	49
120	24	alerta	Alerta de emergência	-8.86638470	13.30720670	resolvido	\N	2025-07-04 12:28:21.293581	2025-07-04 12:34:10.968555	2025-07-04 12:28:21.293581	2025-07-04 12:28:21.293581	\N	49
94	24	alerta	Alerta de emergência	-8.86631470	13.30702750	resolvido	\N	2025-07-04 10:25:37.71677	2025-07-04 10:27:31.639262	2025-07-04 10:25:37.71677	2025-07-04 10:25:37.71677	\N	49
116	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.357889	2025-07-04 12:21:07.938423	2025-07-04 12:20:55.357889	2025-07-04 12:20:55.357889	\N	49
118	24	alerta	Alerta de emergência	-8.86638470	13.30720670	resolvido	\N	2025-07-04 12:27:17.138592	2025-07-04 12:34:12.42449	2025-07-04 12:27:17.138592	2025-07-04 12:27:17.138592	\N	49
95	24	alerta	Alerta de emergência	-8.86631470	13.30702750	resolvido	\N	2025-07-04 10:26:32.201128	2025-07-04 10:34:00.178465	2025-07-04 10:26:32.201128	2025-07-04 10:26:32.201128	22	49
115	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.333926	2025-07-04 12:21:08.771661	2025-07-04 12:20:55.333926	2025-07-04 12:20:55.333926	\N	49
114	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.312927	2025-07-04 12:21:09.49771	2025-07-04 12:20:55.312927	2025-07-04 12:20:55.312927	\N	49
113	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.254483	2025-07-04 12:21:10.218416	2025-07-04 12:20:55.254483	2025-07-04 12:20:55.254483	\N	49
96	24	alerta	Alerta de emergência	-8.86637330	13.30702170	resolvido	\N	2025-07-04 10:32:34.044696	2025-07-04 12:06:47.940856	2025-07-04 10:32:34.044696	2025-07-04 10:32:34.044696	22	49
112	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.236947	2025-07-04 12:21:10.941256	2025-07-04 12:20:55.236947	2025-07-04 12:20:55.236947	\N	49
111	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:20:55.204018	2025-07-04 12:21:11.707164	2025-07-04 12:20:55.204018	2025-07-04 12:20:55.204018	\N	49
97	24	alerta	Alerta de emergência	-8.86603720	13.30681320	resolvido	\N	2025-07-04 12:07:40.938175	2025-07-04 12:10:41.035834	2025-07-04 12:07:40.938175	2025-07-04 12:07:40.938175	22	49
98	24	alerta	Alerta de emergência	-8.86630250	13.30705660	resolvido	\N	2025-07-04 12:11:49.197453	2025-07-04 12:16:41.571093	2025-07-04 12:11:49.197453	2025-07-04 12:11:49.197453	\N	49
130	24	alerta	Alerta de emergência	-8.86644800	13.30688470	resolvido	\N	2025-07-04 12:40:13.766698	2025-07-04 12:40:28.852752	2025-07-04 12:40:13.766698	2025-07-04 12:40:13.766698	\N	49
129	24	alerta	Alerta de emergência	-8.86644800	13.30688470	resolvido	\N	2025-07-04 12:39:48.097425	2025-07-04 12:40:29.727327	2025-07-04 12:39:48.097425	2025-07-04 12:39:48.097425	\N	49
128	24	alerta	Alerta de emergência	-8.86634080	13.30700590	resolvido	\N	2025-07-04 12:39:24.73342	2025-07-04 12:40:30.693173	2025-07-04 12:39:24.73342	2025-07-04 12:39:24.73342	\N	49
106	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:17.110326	2025-07-04 12:18:36.278405	2025-07-04 12:18:17.110326	2025-07-04 12:18:17.110326	\N	49
105	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:17.086846	2025-07-04 12:18:37.1195	2025-07-04 12:18:17.086846	2025-07-04 12:18:17.086846	\N	49
104	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:17.084373	2025-07-04 12:18:37.897718	2025-07-04 12:18:17.084373	2025-07-04 12:18:17.084373	\N	49
103	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:17.002908	2025-07-04 12:18:38.543368	2025-07-04 12:18:17.002908	2025-07-04 12:18:17.002908	\N	49
102	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:16.871243	2025-07-04 12:18:39.132323	2025-07-04 12:18:16.871243	2025-07-04 12:18:16.871243	\N	49
101	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:16.836163	2025-07-04 12:18:39.874716	2025-07-04 12:18:16.836163	2025-07-04 12:18:16.836163	\N	49
100	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:18:16.773618	2025-07-04 12:18:40.491252	2025-07-04 12:18:16.773618	2025-07-04 12:18:16.773618	\N	49
99	24	alerta	Alerta de emergência	-8.86635730	13.30719960	resolvido	\N	2025-07-04 12:18:12.629725	2025-07-04 12:18:41.234964	2025-07-04 12:18:12.629725	2025-07-04 12:18:12.629725	\N	49
127	24	alerta	Alerta de emergência	-8.86660840	13.30754880	resolvido	\N	2025-07-04 12:37:39.353531	2025-07-04 12:40:31.601408	2025-07-04 12:37:39.353531	2025-07-04 12:37:39.353531	\N	49
126	24	alerta	Alerta de emergência	-8.86636860	13.30700260	resolvido	\N	2025-07-04 12:36:48.922262	2025-07-04 12:40:32.562899	2025-07-04 12:36:48.922262	2025-07-04 12:36:48.922262	\N	49
125	24	alerta	Alerta de emergência	-8.86636860	13.30700260	resolvido	\N	2025-07-04 12:36:48.908085	2025-07-04 12:40:33.398099	2025-07-04 12:36:48.908085	2025-07-04 12:36:48.908085	\N	49
110	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:19:17.196664	2025-07-04 12:19:54.870932	2025-07-04 12:19:17.196664	2025-07-04 12:19:17.196664	\N	49
109	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:19:17.194691	2025-07-04 12:19:55.689491	2025-07-04 12:19:17.194691	2025-07-04 12:19:17.194691	\N	49
108	24	alerta	Alerta de emergência	-8.86632040	13.30703060	resolvido	\N	2025-07-04 12:19:17.076084	2025-07-04 12:19:56.478833	2025-07-04 12:19:17.076084	2025-07-04 12:19:17.076084	\N	49
124	24	alerta	Alerta de emergência	-8.86636860	13.30700260	resolvido	\N	2025-07-04 12:36:37.420601	2025-07-04 12:40:34.266539	2025-07-04 12:36:37.420601	2025-07-04 12:36:37.420601	\N	49
131	24	alerta	Alerta de emergência	-8.86644800	13.30688470	resolvido	\N	2025-07-04 12:41:36.648622	2025-07-04 12:53:49.696536	2025-07-04 12:41:36.648622	2025-07-04 12:41:36.648622	\N	49
122	24	alerta	Alerta de emergência	-8.86645340	13.30723980	resolvido	\N	2025-07-04 12:35:37.985104	2025-07-04 12:53:51.427022	2025-07-04 12:35:37.985104	2025-07-04 12:35:37.985104	\N	49
132	24	alerta	Alerta de emergência	-8.86632680	13.30702430	novo	\N	2025-07-08 22:02:02.749376	2025-07-08 22:02:02.749376	2025-07-08 22:02:02.749376	2025-07-08 22:02:02.749376	\N	49
\.


--
-- TOC entry 5005 (class 0 OID 16801)
-- Dependencies: 234
-- Data for Name: alertas_historico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alertas_historico (id, alerta_id, usuario_id, status_anterior, status_novo, observacao, data_registro) FROM stdin;
1	31	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:04.505251
2	30	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:17.189956
3	29	8	fechado	fechado	Status alterado para fechado	2025-06-16 00:35:32.440337
4	28	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:37.791357
5	27	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:41.352997
6	26	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:44.357517
7	25	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:47.061406
8	24	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:50.52988
9	23	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:54.824002
10	22	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:35:58.152895
11	21	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:00.785364
12	20	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:03.343932
13	19	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:05.545935
14	18	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:07.886993
15	17	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:10.382123
16	16	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:12.444571
17	15	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:14.659229
18	14	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:16.750126
19	13	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:18.973466
20	12	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:21.174374
21	11	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:23.244381
22	10	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:25.229591
23	9	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:27.604417
24	8	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:29.913525
25	7	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:32.335455
26	6	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:35.083228
27	5	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:37.496774
28	4	8	fechado	fechado	Status alterado para fechado	2025-06-16 00:36:39.886573
29	3	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:42.051933
30	2	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:44.727992
31	1	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 00:36:57.883204
32	33	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 02:07:09.509056
33	45	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:20.69067
34	44	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:25.34419
35	43	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:27.805708
36	42	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:29.991337
37	41	8	em_progresso	em_progresso	Status alterado para em_progresso	2025-06-16 11:50:32.244021
38	41	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:34.410026
39	40	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:36.513018
40	39	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:38.295064
41	38	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:39.951215
42	37	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:41.431442
43	36	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:43.82482
44	35	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:45.581529
45	34	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 11:50:47.47448
46	55	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:00:55.879737
47	54	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:01:24.910449
48	53	8	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:01:28.490133
49	56	6	fechado	fechado	Status alterado para fechado	2025-06-16 16:45:33.389022
50	52	6	fechado	fechado	Status alterado para fechado	2025-06-16 16:45:36.106111
51	50	6	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:45:38.86519
52	49	6	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:45:41.184939
53	47	6	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:45:43.837954
54	46	6	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:45:46.162802
55	51	6	resolvido	resolvido	Status alterado para resolvido	2025-06-16 16:45:48.833713
56	20	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:05.867897
57	19	22	fechado	fechado	Status alterado para fechado	2025-06-19 00:05:09.935066
58	18	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:12.570866
59	17	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:15.383599
60	16	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:18.218069
61	15	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:20.821502
62	14	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 00:05:23.074382
63	21	22	em_progresso	em_progresso	Status alterado para em_progresso	2025-06-19 02:04:10.982718
64	24	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 02:12:22.63131
65	23	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 02:12:27.751779
66	22	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 02:12:39.46699
67	21	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 02:12:42.850661
68	25	22	resolvido	resolvido	Status alterado para resolvido	2025-06-19 02:12:46.458451
69	26	22	em_progresso	em_progresso	Status alterado para em_progresso	2025-06-19 02:48:41.665172
70	26	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 05:10:42.100969
71	28	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 05:48:03.203353
72	27	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 05:48:49.140435
73	29	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 05:51:26.099708
74	30	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 05:55:23.639362
75	31	21	fechado	fechado	Status alterado para fechado	2025-06-19 05:59:09.721573
76	32	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 06:15:37.769106
77	33	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 07:28:48.316976
78	34	21	fechado	fechado	Status alterado para fechado	2025-06-19 07:32:23.074309
79	35	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 07:38:28.921848
80	36	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 07:49:28.441702
81	37	21	resolvido	resolvido	Status alterado para resolvido	2025-06-19 07:53:11.740037
82	38	22	fechado	fechado	Status alterado para fechado	2025-06-19 09:04:17.667542
83	39	22	fechado	fechado	Status alterado para fechado	2025-06-19 09:07:20.097398
84	40	22	fechado	fechado	Status alterado para fechado	2025-06-19 09:22:04.161964
85	44	21	expirado	expirado	Status alterado para expirado	2025-06-26 15:52:57.701968
86	51	21	resolvido	resolvido	Status alterado para resolvido	2025-07-01 14:15:57.502441
87	50	21	resolvido	resolvido	Status alterado para resolvido	2025-07-01 14:15:59.960189
88	49	21	resolvido	resolvido	Status alterado para resolvido	2025-07-01 14:21:16.108531
89	48	21	resolvido	resolvido	Status alterado para resolvido	2025-07-01 16:10:19.105052
90	85	21	em_progresso	em_progresso	Status alterado para em_progresso	2025-07-01 16:11:45.071685
91	85	22	resolvido	resolvido	Status alterado para resolvido	2025-07-01 16:37:56.999215
92	85	22	resolvido	resolvido	Status alterado para resolvido	2025-07-01 16:38:27.452764
93	85	22	resolvido	resolvido	Status alterado para resolvido	2025-07-01 16:38:43.386287
94	84	21	resolvido	resolvido	Status alterado para resolvido	2025-07-01 16:58:17.061821
95	86	22	resolvido	resolvido	Status alterado para resolvido	2025-07-02 11:33:10.75477
96	94	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 10:27:31.677932
97	95	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 10:34:00.184443
98	96	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:06:47.946342
99	97	22	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:10:41.067666
100	98	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:16:41.603303
101	106	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:36.282597
102	105	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:37.150919
103	104	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:37.901612
104	103	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:38.547023
105	102	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:39.136585
106	101	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:39.879168
107	100	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:40.495957
108	99	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:18:41.265004
109	110	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:19:54.902308
110	109	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:19:55.719589
111	108	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:19:56.508434
112	116	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:07.943139
113	115	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:08.775874
114	114	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:09.500465
115	113	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:10.222716
116	112	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:10.972213
117	111	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:21:11.736317
118	107	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:27:12.586231
119	117	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:27:24.96521
120	121	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:34:10.153363
121	120	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:34:11.000482
122	119	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:34:11.738816
123	118	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:34:12.45564
124	130	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:28.857369
125	129	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:29.72947
126	128	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:30.695377
127	127	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:31.60528
128	126	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:32.566232
129	125	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:33.403496
130	124	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:34.269008
131	123	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:40:35.092788
132	131	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:53:49.909229
133	122	21	resolvido	resolvido	Status alterado para resolvido	2025-07-04 12:53:51.43038
\.


--
-- TOC entry 4997 (class 0 OID 16712)
-- Dependencies: 226
-- Data for Name: arquivos_midia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arquivos_midia (id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo, created_at, criado_por) FROM stdin;
\.


--
-- TOC entry 4993 (class 0 OID 16681)
-- Dependencies: 222
-- Data for Name: cameras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cameras (id, nome, localizacao, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 16761)
-- Dependencies: 230
-- Data for Name: escalonamento_alertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.escalonamento_alertas (id, alerta_id, unidade_anterior, unidade_atual, tempo_escalonamento, motivo, criado_em) FROM stdin;
\.


--
-- TOC entry 5013 (class 0 OID 24839)
-- Dependencies: 242
-- Data for Name: logs_alertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_alertas (id, alerta_id, policial_id, policial_nome, acao, data_hora, policial_nip, policial_bi) FROM stdin;
1	85	21	Kilson Pascoal	aceitou	2025-07-01 16:11:45.075647	101045325	\N
\.


--
-- TOC entry 5003 (class 0 OID 16784)
-- Dependencies: 232
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_auditoria (id, usuario_id, acao, tabela, registro_id, dados_anteriores, dados_novos, ip_address, user_agent, criado_em) FROM stdin;
1	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-15 23:16:54.77579+01
2	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-15 23:16:58.377734+01
3	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 11:51:42.910082+01
4	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 11:51:42.932737+01
5	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 11:51:44.60915+01
6	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 11:51:44.667875+01
7	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:15:10.100811+01
8	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:15:10.203124+01
9	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:15:11.096921+01
10	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:46:57.359405+01
11	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:46:57.547613+01
12	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:46:58.204012+01
13	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:46:58.226949+01
14	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:47:04.581002+01
15	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:47:10.122377+01
16	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:50:52.801132+01
17	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": false, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:50:52.891636+01
18	6	UPDATE	usuarios	8	{"id": 8, "nip": "101045301", "rua": null, "ativo": true, "email": "isabelalberto@gmail.com", "bairro": null, "telefone": "951193914", "municipio": null, "numero_casa": null, "tipo_usuario": "policia", "nome_completo": "Isabel Alberto", "bilhete_identidade": "001234568LA011"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-16 14:50:53.584465+01
19	21	UPDATE	usuarios	23	{"id": 23, "nip": "", "rua": null, "ativo": false, "email": "", "bairro": null, "telefone": "92586439", "municipio": null, "numero_casa": null, "tipo_usuario": "cidadao", "nome_completo": "Joana", "bilhete_identidade": "002345670LA022"}	{"ativo": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-17 04:05:08.32014+01
20	21	UPDATE	usuarios	23	{"id": 23, "nip": "", "rua": null, "ativo": true, "email": "", "bairro": null, "telefone": "92586439", "municipio": null, "numero_casa": null, "tipo_usuario": "cidadao", "nome_completo": "Joana", "bilhete_identidade": "002345670LA022"}	{"ativo": true}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-17 04:05:09.406457+01
21	21	UPDATE	usuarios	23	{"id": 23, "nip": "", "rua": null, "ativo": false, "email": "", "bairro": null, "telefone": "92586439", "municipio": null, "numero_casa": null, "tipo_usuario": "cidadao", "nome_completo": "Joana", "bilhete_identidade": "002345670LA022"}	{"ativo": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 05:15:21.73989+01
22	21	UPDATE	usuarios	23	{"id": 23, "nip": "", "rua": null, "ativo": true, "email": "", "bairro": null, "telefone": "92586439", "municipio": null, "numero_casa": null, "tipo_usuario": "cidadao", "nome_completo": "Joana", "bilhete_identidade": "002345670LA022"}	{"ativo": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 05:15:22.958528+01
23	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "23", "email": "jp@gmail.com", "senha": "12345", "bairro": "Golfe", "telefone": "9555555", "municipio": "Kilamba Kiaxi", "numero_casa": "26", "tipo_usuario": "policia", "nome_completo": "Joao Pena", "bilhete_identidade": "003456781LA012"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 06:43:31.915894+01
24	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "23", "email": "jp@gmail.com", "senha": "12345", "bairro": "Golfe", "telefone": "9555555", "municipio": "Kilamba Kiaxi", "numero_casa": "26", "tipo_usuario": "policia", "nome_completo": "Joao Pena", "bilhete_identidade": "003456781LA012"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 06:43:39.846243+01
25	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "123", "email": "101045325", "senha": "12345", "bairro": "Golfe 2", "telefone": "955555555", "municipio": "Kilamba Kiaxi", "numero_casa": "25", "tipo_usuario": "policia", "nome_completo": "Gabriel Santos", "bilhete_identidade": ""}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 06:55:43.281892+01
26	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "123", "email": "101045325", "senha": "12345", "bairro": "Golfe 2", "telefone": "955555555", "municipio": "Kilamba Kiaxi", "numero_casa": "25", "tipo_usuario": "policia", "nome_completo": "Gabriel Santos", "bilhete_identidade": "002345672LA023"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 06:56:12.253681+01
27	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "123", "email": "101045325", "senha": "12345", "bairro": "Golfe 2", "telefone": "955555555", "municipio": "Kilamba Kiaxi", "numero_casa": "25", "tipo_usuario": "policia", "nome_completo": "Gabriel Santos", "bilhete_identidade": "002345672LA023"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 06:59:19.977432+01
28	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "123", "email": "101045325", "senha": "12345", "bairro": "Golfe 2", "telefone": "955555555", "municipio": "Kilamba Kiaxi", "numero_casa": "14", "tipo_usuario": "", "nome_completo": "Joao Pena", "bilhete_identidade": "002345672LA012"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 07:02:05.442665+01
29	21	CREATE	usuarios	\N	\N	{"nip": "101045200", "rua": "123", "email": "101045325", "senha": "12345", "bairro": "Golfe 2", "telefone": "955555555", "municipio": "Kilamba Kiaxi", "numero_casa": "14", "tipo_usuario": "policia", "nome_completo": "Joao Pena", "bilhete_identidade": "002345672LA012"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36	2025-06-19 07:02:16.194292+01
\.


--
-- TOC entry 4999 (class 0 OID 16736)
-- Dependencies: 228
-- Data for Name: logs_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_sistema (id, tipo, descricao, usuario_id, alerta_id, unidade_id, dados_adicional, criado_em) FROM stdin;
1	success	Login realizado com sucesso	6	\N	\N	{"ip": "::1"}	2025-06-12 15:01:18.303555
2	success	Login realizado com sucesso	6	\N	\N	{"ip": "::1"}	2025-06-12 15:01:28.559058
3	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:31:45.232137
4	success	Login realizado com sucesso	6	\N	\N	{"ip": "::1"}	2025-06-12 15:31:49.272099
5	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:33:30.399674
6	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:33:42.816074
7	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:34:19.088176
8	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:35:45.515211
9	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:35:50.47014
10	info	Usuário desconectado	6	\N	\N	\N	2025-06-12 15:46:46.783002
11	info	Usuário desconectado	\N	\N	\N	\N	2025-06-16 14:48:54.324465
12	info	Usuário desconectado	\N	\N	\N	\N	2025-06-16 15:34:05.551402
13	success	Login realizado com sucesso	6	\N	\N	{"ip": "::1"}	2025-06-16 15:34:08.742831
14	info	Usuário desconectado	6	\N	\N	\N	2025-06-16 15:34:55.201767
\.


--
-- TOC entry 4995 (class 0 OID 16691)
-- Dependencies: 224
-- Data for Name: mensagens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensagens (id, remetente_id, destinatario_id, conteudo, media_url, lida, created_at) FROM stdin;
\.


--
-- TOC entry 4991 (class 0 OID 16435)
-- Dependencies: 220
-- Data for Name: notificacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacoes (id, usuario_id, tipo, titulo, mensagem, dados, lida, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4989 (class 0 OID 16414)
-- Dependencies: 218
-- Data for Name: sessoes_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessoes_usuario (id, user_id, token_hash, ip_address, expira_em, ativo) FROM stdin;
\.


--
-- TOC entry 5009 (class 0 OID 24785)
-- Dependencies: 238
-- Data for Name: unidades_policiais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unidades_policiais (id, nome, codigo_unidade, endereco, localizacao_lat, localizacao_lng, telefone, ativa, criado_em, atualizado_em) FROM stdin;
9	Comando Provincial de Luanda	CPL-001	Rua Rainha Ginga, Luanda	-8.83830000	13.23440000	222123456	t	2025-06-17 01:51:10.143634	2025-06-17 01:51:10.143634
10	Esquadra do Rangel	ESQ-001	Rua Rainha Nzinga, Rangel	-8.81470000	13.23020000	222123457	t	2025-06-17 01:51:10.143634	2025-06-17 01:51:10.143634
11	Esquadra do Maianga	ESQ-002	Rua Rainha Nzinga, Maianga	-8.83310000	13.22450000	222123458	t	2025-06-17 01:51:10.143634	2025-06-17 01:51:10.143634
12	Esquadra do Samba	ESQ-003	Rua Rainha Nzinga, Samba	-8.85320000	13.24110000	222123459	t	2025-06-17 01:51:10.143634	2025-06-17 01:51:10.143634
49	Posto Policial do KM9/A  	ESQ-004	 48M7+59R, Luanda  	-8.86696500	13.31334100	934567890	t	2025-06-26 20:56:16.897392	2025-06-26 20:56:16.897392
\.


--
-- TOC entry 5007 (class 0 OID 24719)
-- Dependencies: 236
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome_completo, email, senha, tipo_usuario, telefone, bilhete_identidade, nip, ativo, criado_em, atualizado_em, rua, municipio, bairro, numero_casa, localizacao_lat, localizacao_lng, endereco, contacto_familiar, ultima_atualizacao) FROM stdin;
14	João Silva	joao@email.com	$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX	policia	912345678	123456789LA123	12345	t	2025-06-17 01:51:10.136779	2025-06-17 01:51:10.136779	Rua Principal	Luanda	Ingombota	\N	\N	\N	\N	\N	\N
15	Maria Santos	maria@email.com	$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX	policia	923456789	987654321LA123	54321	t	2025-06-17 01:51:10.136779	2025-06-17 01:51:10.136779	Rua Secundária	Luanda	Maianga	\N	\N	\N	\N	\N	\N
16	Pedro Costa	pedro@email.com	$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX	cidadao	934567890	456789123LA123	\N	t	2025-06-17 01:51:10.136779	2025-06-17 01:51:10.136779	Rua Terceira	Luanda	Samba	\N	\N	\N	\N	\N	\N
17	Ana Oliveira	ana@email.com	$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX	cidadao	945678901	789123456LA123	\N	t	2025-06-17 01:51:10.136779	2025-06-17 01:51:10.136779	Rua Quarta	Luanda	Rangel	\N	\N	\N	\N	\N	\N
18	Administrador	admin@criminalalert.com	admin123	admin	912345678	\N	\N	t	2025-06-17 01:59:31.675575	2025-06-17 01:59:31.675575	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	Isabel Alberto	alberto@gmail.com	$2a$10$L7UzFN9GKTOaCotGjEuybu/jR6SBWq3c7PUO6zzL9Ndbl0jli9Uxy	cidadao	938820244	003456787LA034		t	2025-06-17 02:13:00.729665	2025-06-17 02:13:00.729665	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	Kilson Pascoal	kilson@gmail.com	$2b$10$j9jOyUKsEZBAGkl6.HvlHua7ixJWsNPHvAMQApx9EtlQYYFRyTULS	admin	928885660	\N	101045325	t	2025-06-17 02:16:26.89266	2025-06-17 02:16:26.89266	56	Kilamba Kiaxi	Golfe 1	\N	\N	\N	\N	\N	\N
22	José Mateus 	k@gmail.con	$2a$10$LgKbB45FW4afhFkv0iqtfOMZMCZW4XCfDz5JJOvXKpAoHdQ.5IiV2	policia	953247224	002345678LA023	101045301	t	2025-06-17 02:27:54.253036	2025-07-04 12:11:15.800022	\N	\N	\N	\N	-8.86630250	13.30705660	\N	\N	\N
23	Joana		$2a$10$REv5zMXU9yjEVgsoveO4heG84NbLZFtIF2OgodhZ2VnQcYPaIK0fe	cidadao	92586439	002345670LA022		t	2025-06-17 02:38:32.850538	2025-06-19 05:15:22.929794	\N	\N	\N	\N	\N	\N	\N	\N	\N
24	Selson Pascoal	sel@gmail.com	$2a$10$JQF7Iy6H8wmkrcPSN.atTup4FQAMl0FNAIUoRKOZsevCCDd2A9BtG	cidadao	927709196	002345672LA034	\N	t	2025-06-19 06:14:10.244408	2025-06-19 06:14:10.244408	23	Belas 	Bita progresso 	114	\N	\N	\N	923260592	\N
25	Joao Pena	101045325	$2a$12$GeRJa65CGelQUd7rWFxsT.GWCLGBshkj3Jr55feiv5xwqoWmrCzVy	policia	955555555	002345672LA012	101045200	t	2025-06-19 07:02:16.186634	2025-06-19 07:02:16.186634	123	Kilamba Kiaxi	Golfe 2	14	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 233
-- Name: alertas_historico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alertas_historico_id_seq', 133, true);


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 239
-- Name: alertas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alertas_id_seq', 132, true);


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 225
-- Name: arquivos_midia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arquivos_midia_id_seq', 1, false);


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 221
-- Name: cameras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cameras_id_seq', 1, false);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 229
-- Name: escalonamento_alertas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.escalonamento_alertas_id_seq', 1, false);


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 241
-- Name: logs_alertas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_alertas_id_seq', 1, true);


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 231
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 29, true);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 227
-- Name: logs_sistema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_sistema_id_seq', 14, true);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 223
-- Name: mensagens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensagens_id_seq', 1, false);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 219
-- Name: notificacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacoes_id_seq', 1, false);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 217
-- Name: sessoes_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessoes_usuario_id_seq', 1, false);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 237
-- Name: unidades_policiais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unidades_policiais_id_seq', 49, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 235
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 25, true);


--
-- TOC entry 4820 (class 2606 OID 16809)
-- Name: alertas_historico alertas_historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas_historico
    ADD CONSTRAINT alertas_historico_pkey PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 24809)
-- Name: alertas alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 16720)
-- Name: arquivos_midia arquivos_midia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arquivos_midia
    ADD CONSTRAINT arquivos_midia_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 16689)
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 16767)
-- Name: escalonamento_alertas escalonamento_alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escalonamento_alertas
    ADD CONSTRAINT escalonamento_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 24845)
-- Name: logs_alertas logs_alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_alertas
    ADD CONSTRAINT logs_alertas_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 16792)
-- Name: logs_auditoria logs_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16744)
-- Name: logs_sistema logs_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_sistema
    ADD CONSTRAINT logs_sistema_pkey PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 16700)
-- Name: mensagens mensagens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 16445)
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 16420)
-- Name: sessoes_usuario sessoes_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessoes_usuario
    ADD CONSTRAINT sessoes_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 24797)
-- Name: unidades_policiais unidades_policiais_codigo_unidade_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_policiais
    ADD CONSTRAINT unidades_policiais_codigo_unidade_key UNIQUE (codigo_unidade);


--
-- TOC entry 4832 (class 2606 OID 24795)
-- Name: unidades_policiais unidades_policiais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_policiais
    ADD CONSTRAINT unidades_policiais_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 24731)
-- Name: usuarios usuarios_bilhete_identidade_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_bilhete_identidade_key UNIQUE (bilhete_identidade);


--
-- TOC entry 4826 (class 2606 OID 24729)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4828 (class 2606 OID 24727)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 1259 OID 24825)
-- Name: idx_alertas_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alertas_created_at ON public.alertas USING btree (created_at);


--
-- TOC entry 4836 (class 1259 OID 24824)
-- Name: idx_alertas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alertas_status ON public.alertas USING btree (status);


--
-- TOC entry 4812 (class 1259 OID 16730)
-- Name: idx_arquivos_midia_criado_por; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_arquivos_midia_criado_por ON public.arquivos_midia USING btree (criado_por);


--
-- TOC entry 4804 (class 1259 OID 16726)
-- Name: idx_cameras_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cameras_status ON public.cameras USING btree (status);


--
-- TOC entry 4805 (class 1259 OID 16729)
-- Name: idx_mensagens_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mensagens_created_at ON public.mensagens USING btree (created_at);


--
-- TOC entry 4806 (class 1259 OID 16728)
-- Name: idx_mensagens_destinatario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mensagens_destinatario ON public.mensagens USING btree (destinatario_id);


--
-- TOC entry 4807 (class 1259 OID 16727)
-- Name: idx_mensagens_remetente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mensagens_remetente ON public.mensagens USING btree (remetente_id);


--
-- TOC entry 4796 (class 1259 OID 16734)
-- Name: idx_notificacoes_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificacoes_created_at ON public.notificacoes USING btree (created_at);


--
-- TOC entry 4797 (class 1259 OID 16733)
-- Name: idx_notificacoes_lida; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificacoes_lida ON public.notificacoes USING btree (lida);


--
-- TOC entry 4798 (class 1259 OID 16732)
-- Name: idx_notificacoes_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificacoes_tipo ON public.notificacoes USING btree (tipo);


--
-- TOC entry 4799 (class 1259 OID 16731)
-- Name: idx_notificacoes_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificacoes_usuario ON public.notificacoes USING btree (usuario_id);


--
-- TOC entry 4821 (class 1259 OID 24827)
-- Name: idx_usuarios_telefone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_telefone ON public.usuarios USING btree (telefone);


--
-- TOC entry 4822 (class 1259 OID 24826)
-- Name: idx_usuarios_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_tipo ON public.usuarios USING btree (tipo_usuario);


--
-- TOC entry 4839 (class 2606 OID 24828)
-- Name: alertas alertas_policial_atribuido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_policial_atribuido_id_fkey FOREIGN KEY (policial_atribuido_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4840 (class 2606 OID 24815)
-- Name: alertas alertas_unidade_atendente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_unidade_atendente_id_fkey FOREIGN KEY (unidade_atendente_id) REFERENCES public.unidades_policiais(id);


--
-- TOC entry 4841 (class 2606 OID 24833)
-- Name: alertas alertas_unidade_atribuida_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_unidade_atribuida_id_fkey FOREIGN KEY (unidade_atribuida_id) REFERENCES public.unidades_policiais(id);


--
-- TOC entry 4842 (class 2606 OID 24810)
-- Name: alertas alertas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- Completed on 2025-07-09 03:46:40

--
-- PostgreSQL database dump complete
--

