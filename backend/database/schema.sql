-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Chat (
  CHAT_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  Title text NOT NULL,
  Created_at timestamp with time zone NOT NULL DEFAULT now(),
  USER_ID uuid NOT NULL,
  CONSTRAINT Chat_pkey PRIMARY KEY (CHAT_ID),
  CONSTRAINT Chat_USER_ID_fkey FOREIGN KEY (USER_ID) REFERENCES public.User(USER_ID)
);
CREATE TABLE public.File (
  FILE_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  filetype character varying NOT NULL,
  path text NOT NULL,
  uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CHAT_ID integer NOT NULL UNIQUE,
  CONSTRAINT File_pkey PRIMARY KEY (FILE_ID),
  CONSTRAINT fk_file_chat FOREIGN KEY (CHAT_ID) REFERENCES public.Chat(CHAT_ID)
);
CREATE TABLE public.Query (
  QUERY_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  query_text text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CHAT_ID integer NOT NULL,
  CONSTRAINT Query_pkey PRIMARY KEY (QUERY_ID),
  CONSTRAINT fk_query_chat FOREIGN KEY (CHAT_ID) REFERENCES public.Chat(CHAT_ID)
);
CREATE TABLE public.Rating (
  RATING_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  Created_at timestamp with time zone NOT NULL DEFAULT now(),
  Score bigint NOT NULL,
  Comment text NOT NULL,
  RESPONSE_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  CONSTRAINT Rating_pkey PRIMARY KEY (RATING_ID),
  CONSTRAINT Rating_RESPONSE_ID_fkey FOREIGN KEY (RESPONSE_ID) REFERENCES public.Response(RESPONSE_ID)
);
CREATE TABLE public.Response (
  RESPONSE_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  answer text NOT NULL,
  explanation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now() UNIQUE,
  QUERY_ID integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  CONSTRAINT Response_pkey PRIMARY KEY (RESPONSE_ID),
  CONSTRAINT Response_QUERY_ID_fkey FOREIGN KEY (QUERY_ID) REFERENCES public.Query(QUERY_ID)
);
CREATE TABLE public.User (
  USER_ID uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  username character varying NOT NULL UNIQUE,
  user_status character varying NOT NULL CHECK (user_status::text = ANY (ARRAY['Enabled'::character varying, 'Disabled'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT User_pkey PRIMARY KEY (USER_ID)
);