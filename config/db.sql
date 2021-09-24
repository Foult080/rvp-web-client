CREATE TABLE `Users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` text,
  `email` text,
  `password` text,
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `web_sites` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `name` text,
  `created_at` datetime DEFAULT (now())
);

ALTER TABLE `web_sites` ADD FOREIGN KEY (`id_user`) REFERENCES `Users` (`id`);
