/**
* - Run the following queries to build the DB
**/

CREATE TABLE `command_log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `playfabid` varchar(18) NOT NULL DEFAULT '',
  `command` varchar(50) NOT NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4;




CREATE TABLE `killfeed` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `killer_leaderboard_id` int(11) NOT NULL,
  `killed_leaderboard_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `killer_killed` (`killer_leaderboard_id`,`killed_leaderboard_id`),
  KEY `killed_id` (`killed_leaderboard_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51770 DEFAULT CHARSET=utf8mb4;





CREATE TABLE `leaderboard` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `playfabid` varchar(17) NOT NULL DEFAULT '',
  `name` varchar(100) DEFAULT NULL,
  `kills` int(11) DEFAULT NULL,
  `deaths` int(11) DEFAULT NULL,
  `k_d` float DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `playfabid` (`playfabid`)
) ENGINE=InnoDB AUTO_INCREMENT=97720 DEFAULT CHARSET=utf8mb4;