CREATE DATABASE app;
use app;

CREATE TABLE `Users` (
  `id` BINARY(36) PRIMARY KEY,
  `name` text,
  `email` text,
  `password` text,
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `web_sites` (
  `id` BINARY(36) PRIMARY KEY,
  `id_user` BINARY(36),
  `name` text,
  `created_at` datetime DEFAULT (now())
);

ALTER TABLE `web_sites` ADD FOREIGN KEY (`id_user`) REFERENCES `Users` (`id`);
