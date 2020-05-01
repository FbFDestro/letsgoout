create table users (
	id serial primary key,
	email varchar(100) not null,
	name varchar(100) not null,
	fb_user_id varchar(100)
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
