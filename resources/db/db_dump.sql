-- MySQL dump 10.13  Distrib 5.7.17, for osx10.12 (x86_64)
--
-- Host: localhost    Database: acl
-- ------------------------------------------------------
-- Server version	5.7.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tb_acl_permissions`
--

DROP TABLE IF EXISTS `tb_acl_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_acl_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL COMMENT '0 FOR ALL CITIES',
  `panel_id` int(11) NOT NULL,
  `level_id` int(11) NOT NULL COMMENT '0-admin,1-regular',
  `role` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tb_acl_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_acl_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_acl_permissions`
--

LOCK TABLES `tb_acl_permissions` WRITE;
/*!40000 ALTER TABLE `tb_acl_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_acl_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_acl_tokens`
--

DROP TABLE IF EXISTS `tb_acl_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_acl_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `TTL` int(11) NOT NULL DEFAULT '7' COMMENT 'in days, 999-> infinte TTL',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tb_acl_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_acl_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_acl_tokens`
--

LOCK TABLES `tb_acl_tokens` WRITE;
/*!40000 ALTER TABLE `tb_acl_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_acl_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_acl_users`
--

DROP TABLE IF EXISTS `tb_acl_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_acl_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `phone_number` varchar(12) DEFAULT NULL,
  `is_infinite_TTL` tinyint(1) DEFAULT '0' COMMENT 'when set, users access token will not die',
  `city` varchar(50) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'INACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `recovery_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_acl_users`
--

LOCK TABLES `tb_acl_users` WRITE;
/*!40000 ALTER TABLE `tb_acl_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_acl_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_cities`
--

DROP TABLE IF EXISTS `tb_cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `inserted_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_cities`
--

LOCK TABLES `tb_cities` WRITE;
/*!40000 ALTER TABLE `tb_cities` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_levels`
--

DROP TABLE IF EXISTS `tb_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `inserted_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_levels`
--

LOCK TABLES `tb_levels` WRITE;
/*!40000 ALTER TABLE `tb_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_panel_audit`
--

DROP TABLE IF EXISTS `tb_panel_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_panel_audit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `access_token` varchar(64) NOT NULL,
  `panel_id` int(11) NOT NULL,
  `api` varchar(50) NOT NULL,
  `reference_id` varchar(50) NOT NULL,
  `request` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_panel_audit`
--

LOCK TABLES `tb_panel_audit` WRITE;
/*!40000 ALTER TABLE `tb_panel_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_panel_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_panels`
--

DROP TABLE IF EXISTS `tb_panels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_panels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `inserted_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_panels`
--

LOCK TABLES `tb_panels` WRITE;
/*!40000 ALTER TABLE `tb_panels` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_panels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_promotions`
--

DROP TABLE IF EXISTS `tb_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_promotions` (
  `promo_id` int(11) NOT NULL AUTO_INCREMENT,
  `promo_code` varchar(15) NOT NULL,
  `coupon_id` int(11) DEFAULT NULL,
  `coupon_validity` int(11) DEFAULT '30',
  PRIMARY KEY (`promo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_promotions`
--

LOCK TABLES `tb_promotions` WRITE;
/*!40000 ALTER TABLE `tb_promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_promotions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-06-06 15:49:38
