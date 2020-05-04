drop table if exists users cascade;

drop table if exists local_users cascade;

drop table if exists fb_users cascade;

drop table if exists event cascade;

drop table if exists user_relationship cascade;

drop table if exists user_event cascade;

create table users (
	id serial primary key,
	name varchar(100) not null,
	username varchar(40) unique not null
    /* can add other data like picture */
);


create table local_users  (
    email varchar(100) primary key,
    password varchar(60) not null,
    users_id integer,

    constraint fk_local_users
        foreign key(users_id)
        references users(id)
);

create table fb_users(
    fb_id varchar(100) primary key,
    email varchar(100) not null unique,
    users_id integer,

    constraint fk_fb_users
        foreign key(users_id)
        references  users(id)
);

create table event (
	id serial primary key,
	name varchar(200),
	description text,
	creation_timestamp timestamp default now(),
	start_timestamp timestamp,
	end_timestamp timestamp
);

create table user_relationship (
	user1_id integer,
	user2_id integer,
	status char(1),

	constraint pk_relationship
		primary key(user1_id, user2_id),
	constraint fk_user1_relationship
		foreign key(user1_id)
		references users(id),
	constraint fk_user2_relationship
		foreign key(user2_id)
		references users(id)
);

create table user_event (
	user_id integer,
	event_id integer,
	status char(1),

	constraint pk_user_event
		primary key (user_id, event_id),
	constraint fk_user
		foreign key(user_id)
		references users(id),
	constraint fk_event
		foreign key(event_id)
		references event(id)
);