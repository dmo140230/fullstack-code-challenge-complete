BEGIN;

CREATE SEQUENCE if not exists users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE if not exists users (
    id bigint DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    email character varying(256) NOT NULL,
    first_name character varying(256) NOT NULL,
    last_name character varying(256) NOT NULL,
    password character varying(256),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE SEQUENCE if not exists product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE if not exists products (
    id bigint DEFAULT nextval('product_id_seq'::regclass) NOT NULL,
    name character varying(256) NOT NULL,
    price NUMERIC (16, 2) NOT NULL,
    description character varying(256) NOT NULL,
    image character varying(256),
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE if not exists user_products (
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    CONSTRAINT user_products_pkey PRIMARY KEY (user_id, product_id),
    CONSTRAINT user_products_user_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT user_products_product_id_fk FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

COMMIT;
