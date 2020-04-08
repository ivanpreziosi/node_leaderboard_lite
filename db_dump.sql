DROP DATABASE IF EXISTS `node_leaderboard_lite`;
CREATE DATABASE IF NOT EXISTS `node_leaderboard_lite`;
USE `node_leaderboard_lite`;

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` char(32) NOT NULL,
  `email` varchar(60) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `date_subscribed` datetime NOT NULL DEFAULT current_timestamp(),
  `auth_token` char(32) DEFAULT NULL,
  `token_creation_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `leaderboard`;
CREATE TABLE IF NOT EXISTS `leaderboard` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `score` int(10) unsigned NOT NULL,
  `save_date` datetime NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `sender_ip` varchar(50) NOT NULL DEFAULT 'Unknown',
  PRIMARY KEY (`id`),
  KEY `fk_leaderboard_user` (`user_id`),
  CONSTRAINT `fk_leaderboard_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8;


