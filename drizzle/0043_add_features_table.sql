CREATE TABLE `features` (
	`feature_id` varchar(36) NOT NULL,
	`key` varchar(50) NOT NULL,
	`active` boolean NOT NULL DEFAULT false,
	`limit` int DEFAULT 0,
	CONSTRAINT `features_feature_id` PRIMARY KEY(`feature_id`)
);
