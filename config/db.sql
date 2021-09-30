CREATE DATABASE app;
use app;

CREATE TABLE `Users` (
  `id` text PRIMARY KEY,
  `name` text,
  `email` text,
  `password` text,
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `web_sites` (
  `id` text PRIMARY KEY,
  `id_user` text,
  `name` text,
  `url` text,
  `created_at` datetime DEFAULT (now())
);

ALTER TABLE `web_sites` ADD FOREIGN KEY (`id_user`) REFERENCES `Users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;