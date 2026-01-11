CREATE DATABASE  IF NOT EXISTS `erp_ventes` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `erp_ventes`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: erp_ventes
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avoirs`
--

DROP TABLE IF EXISTS `avoirs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avoirs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `retour_id` int NOT NULL,
  `client_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `type` enum('remboursement','avoir_client','échange') DEFAULT 'avoir_client',
  `statut` enum('généré','appliqué','annulé') DEFAULT NULL,
  `date_avoir` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `retour_id` (`retour_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `avoirs_ibfk_1` FOREIGN KEY (`retour_id`) REFERENCES `retours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avoirs_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avoirs`
--

LOCK TABLES `avoirs` WRITE;
/*!40000 ALTER TABLE `avoirs` DISABLE KEYS */;
INSERT INTO `avoirs` VALUES (1,'AVOIR-2026-0001',2,5,100.00,'avoir_client','annulé','2026-01-04','2026-01-04 03:05:05'),(2,'AVOIR-2026-0002',2,5,100.00,'remboursement','généré','2026-01-04','2026-01-04 03:05:16'),(3,'AVOIR-2026-0003',4,4,50.00,'remboursement','annulé','2026-01-04','2026-01-04 03:15:10'),(4,'AVOIR-2026-0004',1,6,100.00,'avoir_client','généré','2026-01-04','2026-01-04 03:15:33'),(5,'AVOIR-2026-0005',5,4,150.00,'remboursement','appliqué','2026-01-04','2026-01-04 03:22:33'),(6,'AVOIR-2026-0006',6,1,100.00,'avoir_client','généré','2026-01-04','2026-01-04 03:31:57'),(7,'AVOIR-2026-0007',7,6,100.00,'avoir_client','appliqué','2026-01-04','2026-01-04 03:36:29'),(8,'AVOIR-2026-0008',9,10,75.00,'remboursement','appliqué','2026-01-04','2026-01-04 03:56:53'),(9,'AVOIR-2026-0009',10,1,0.00,'échange','annulé','2026-01-04','2026-01-04 04:32:35'),(10,'AVOIR-2026-0010',11,7,0.00,'échange','appliqué','2026-01-04','2026-01-04 04:37:17'),(12,'AVOIR-2026-0011',13,1,0.00,'échange','appliqué','2026-01-04','2026-01-04 05:21:41');
/*!40000 ALTER TABLE `avoirs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` text,
  `solde` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'amirao','emij@ijij','45799535','ggkuyhu',-200.00,'2026-01-03 00:55:09','2026-01-04 06:05:28'),(4,'islem','islem@fff','54546843','oued ellil\n',240.00,'2026-01-03 15:53:07','2026-01-04 06:12:26'),(5,'mariem','mariem@vdf','556','boumhal',0.00,'2026-01-03 16:19:05','2026-01-04 06:05:28'),(6,'jihen','jjk@ii','65454644','bardo',-100.00,'2026-01-03 16:41:49','2026-01-04 06:05:28'),(7,'yassmine','g@fdvdf','54684646','manouba',0.00,'2026-01-03 16:45:04','2026-01-04 06:05:28'),(10,'ya',NULL,NULL,NULL,0.00,'2026-01-03 19:23:46','2026-01-04 06:02:34');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factures`
--

DROP TABLE IF EXISTS `factures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `client_id` int NOT NULL,
  `date_facture` date NOT NULL,
  `montant_ht` decimal(10,2) NOT NULL,
  `montant_tva` decimal(10,2) NOT NULL,
  `montant_ttc` decimal(10,2) NOT NULL,
  `statut` enum('brouillon','validée','payée','annulée','partiellement_payée') DEFAULT 'brouillon',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factures`
--

LOCK TABLES `factures` WRITE;
/*!40000 ALTER TABLE `factures` DISABLE KEYS */;
INSERT INTO `factures` VALUES (1,'FACT-2026-0001',1,'2026-01-03',40.00,8.00,48.00,'payée','2026-01-03 02:52:23'),(2,'FACT-2026-0002',4,'2026-01-03',30.00,6.00,36.00,'payée','2026-01-03 16:13:17'),(3,'FACT-2026-0003',5,'2026-01-03',30.00,6.00,36.00,'payée','2026-01-03 16:20:36'),(4,'FACT-2026-0004',1,'2026-01-03',20.00,4.00,24.00,'payée','2026-01-03 16:38:20'),(5,'FACT-2026-0005',6,'2026-01-03',20.00,4.00,24.00,'payée','2026-01-03 16:42:28'),(6,'FACT-2026-0006',7,'2026-01-03',60.00,12.00,72.00,'payée','2026-01-03 16:45:25'),(7,'FACT-2026-0007',1,'2026-01-03',10.00,2.00,12.00,'payée','2026-01-03 16:54:20'),(8,'FACT-2026-0008',10,'2026-01-03',50.00,10.00,60.00,'annulée','2026-01-03 19:24:09'),(9,'FACT-2026-0009',4,'2026-01-04',200.00,40.00,240.00,'brouillon','2026-01-04 06:12:26');
/*!40000 ALTER TABLE `factures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lignes_facture`
--

DROP TABLE IF EXISTS `lignes_facture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lignes_facture` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facture_id` int NOT NULL,
  `produit_id` int NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `remise` decimal(5,2) DEFAULT '0.00',
  `sous_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `facture_id` (`facture_id`),
  KEY `produit_id` (`produit_id`),
  CONSTRAINT `lignes_facture_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lignes_facture_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `lignes_facture_chk_1` CHECK ((`quantite` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lignes_facture`
--

LOCK TABLES `lignes_facture` WRITE;
/*!40000 ALTER TABLE `lignes_facture` DISABLE KEYS */;
INSERT INTO `lignes_facture` VALUES (1,1,1,2,20.00,0.00,40.00),(2,2,2,1,10.00,0.00,10.00),(3,2,1,2,20.00,50.00,20.00),(4,3,2,3,10.00,0.00,30.00),(5,4,1,1,20.00,0.00,20.00),(6,5,2,2,10.00,0.00,20.00),(7,6,1,3,20.00,0.00,60.00),(8,7,2,1,10.00,0.00,10.00),(9,8,3,1,50.00,0.00,50.00),(10,9,3,4,50.00,0.00,200.00);
/*!40000 ALTER TABLE `lignes_facture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lignes_retour`
--

DROP TABLE IF EXISTS `lignes_retour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lignes_retour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `retour_id` int NOT NULL,
  `produit_id` int NOT NULL,
  `ligne_facture_id` int NOT NULL,
  `quantite_retournee` int NOT NULL,
  `raison` text,
  PRIMARY KEY (`id`),
  KEY `retour_id` (`retour_id`),
  KEY `produit_id` (`produit_id`),
  KEY `ligne_facture_id` (`ligne_facture_id`),
  CONSTRAINT `lignes_retour_ibfk_1` FOREIGN KEY (`retour_id`) REFERENCES `retours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lignes_retour_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `lignes_retour_ibfk_3` FOREIGN KEY (`ligne_facture_id`) REFERENCES `lignes_facture` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `lignes_retour_chk_1` CHECK ((`quantite_retournee` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lignes_retour`
--

LOCK TABLES `lignes_retour` WRITE;
/*!40000 ALTER TABLE `lignes_retour` DISABLE KEYS */;
INSERT INTO `lignes_retour` VALUES (1,1,2,6,1,NULL),(2,2,2,4,3,NULL),(3,3,2,8,1,NULL),(4,4,2,2,1,NULL),(5,5,1,3,2,NULL),(6,6,1,1,1,NULL),(7,7,2,6,1,NULL),(8,8,1,5,1,NULL),(9,9,3,9,1,NULL),(10,10,2,8,1,NULL),(11,11,1,7,1,NULL),(12,12,1,7,3,NULL),(13,13,2,8,1,NULL);
/*!40000 ALTER TABLE `lignes_retour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `facture_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode_paiement` enum('espèces','carte','virement','chèque','avoir') DEFAULT NULL,
  `date_paiement` date NOT NULL,
  `statut` enum('reçu','en_attente','annulé','rejeté') DEFAULT 'reçu',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `facture_id` (`facture_id`),
  CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiements`
--

LOCK TABLES `paiements` WRITE;
/*!40000 ALTER TABLE `paiements` DISABLE KEYS */;
INSERT INTO `paiements` VALUES (1,'PAY-1767456494086-162',1,48.00,'espèces','2026-01-03','reçu',NULL,'2026-01-03 16:08:14'),(2,'PAY-1767456886833-102',2,36.00,'carte','2026-01-03','reçu',NULL,'2026-01-03 16:14:46'),(3,'PAY-1767457293467-125',3,36.00,'virement','2026-01-03','reçu','56695959478','2026-01-03 16:21:33'),(4,'PAY-1767458430391-814',4,20.00,'espèces','2026-01-03','reçu',NULL,'2026-01-03 16:40:30'),(5,'PAY-1767458628170-755',5,24.00,'chèque','2026-01-03','reçu','564684684','2026-01-03 16:43:48'),(6,'PAY-1767458772520-658',6,72.00,'espèces','2026-01-03','reçu',NULL,'2026-01-03 16:46:12'),(7,'PAY-1767466288525-998',7,12.00,'carte','2026-01-03','reçu',NULL,'2026-01-03 18:51:28'),(8,'PAY-1767466312924-351',4,4.00,'virement','2026-01-03','reçu',NULL,'2026-01-03 18:51:52'),(9,'PAY-1767468291064-825',8,60.00,'espèces','2026-01-03','annulé',NULL,'2026-01-03 19:24:51'),(10,'PAY-AVOIR-AVOIR-2026-0007',1,100.00,'avoir','2026-01-04','reçu','Avoir appliqué: AVOIR-2026-0007','2026-01-04 05:27:51');
/*!40000 ALTER TABLE `paiements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produits`
--

DROP TABLE IF EXISTS `produits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `description` text,
  `prix_ht` decimal(10,2) NOT NULL,
  `tva` decimal(5,2) DEFAULT '20.00',
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produits`
--

LOCK TABLES `produits` WRITE;
/*!40000 ALTER TABLE `produits` DISABLE KEYS */;
INSERT INTO `produits` VALUES (1,'p001','mascara','ysl',20.00,20.00,109,'2026-01-03 02:51:16'),(2,'p002','eyeliner','sheglam waterproof ',10.00,20.00,38,'2026-01-03 16:12:02'),(3,'p003','primer','sheglam',50.00,20.00,2,'2026-01-03 18:16:08');
/*!40000 ALTER TABLE `produits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retours`
--

DROP TABLE IF EXISTS `retours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `facture_id` int NOT NULL,
  `client_id` int NOT NULL,
  `date_retour` date NOT NULL,
  `motif` enum('défectueux','non_conforme','erreur_commande','autre') NOT NULL,
  `statut` enum('demandé','validé','réceptionné','clôturé','rejeté') DEFAULT 'demandé',
  `date_validation` datetime DEFAULT NULL,
  `valide_par` varchar(100) DEFAULT NULL,
  `date_reception` datetime DEFAULT NULL,
  `receptionne_par` varchar(100) DEFAULT NULL,
  `date_cloture` datetime DEFAULT NULL,
  `cloture_par` varchar(100) DEFAULT NULL,
  `raison_rejet` varchar(255) DEFAULT NULL,
  `rejete_par` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `facture_id` (`facture_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `retours_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `retours_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retours`
--

LOCK TABLES `retours` WRITE;
/*!40000 ALTER TABLE `retours` DISABLE KEYS */;
INSERT INTO `retours` VALUES (1,'RET-2026-0001',5,6,'2026-01-04','non_conforme','clôturé','2026-01-04 02:27:18','SAV','2026-01-04 03:14:47','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 01:22:09','2026-01-04 03:15:33'),(2,'RET-2026-0002',3,5,'2026-01-04','non_conforme','clôturé','2026-01-04 02:20:35','SAV','2026-01-04 03:03:52','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 01:23:35','2026-01-04 03:05:05'),(3,'RET-2026-0003',7,1,'2026-01-04','erreur_commande','rejeté','2026-01-04 03:13:39',NULL,NULL,NULL,NULL,NULL,'...','Admin',NULL,'2026-01-04 02:27:34','2026-01-04 03:13:39'),(4,'RET-2026-0004',2,4,'2026-01-04','autre','clôturé','2026-01-04 03:14:28','Admin','2026-01-04 03:14:39','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 03:14:21','2026-01-04 03:15:10'),(5,'RET-2026-0005',2,4,'2026-01-04','défectueux','clôturé','2026-01-04 03:22:12','Admin','2026-01-04 03:22:17','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 03:22:03','2026-01-04 03:22:33'),(6,'RET-2026-0006',1,1,'2026-01-04','non_conforme','clôturé','2026-01-04 03:31:44','Admin','2026-01-04 03:31:49','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 03:31:35','2026-01-04 03:31:57'),(7,'RET-2026-0007',5,6,'2026-01-04','non_conforme','clôturé','2026-01-04 03:36:16','Admin','2026-01-04 03:36:20','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 03:35:55','2026-01-04 03:36:29'),(8,'RET-2026-0008',4,1,'2026-01-04','non_conforme','rejeté','2026-01-04 03:37:12',NULL,NULL,NULL,NULL,NULL,'kll','Admin',NULL,'2026-01-04 03:37:02','2026-01-04 03:37:12'),(9,'RET-2026-0009',8,10,'2026-01-04','non_conforme','clôturé','2026-01-04 03:56:11','Admin','2026-01-04 03:56:29','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 03:55:55','2026-01-04 03:56:53'),(10,'RET-2026-0010',7,1,'2026-01-04','non_conforme','clôturé','2026-01-04 04:14:29','Admin','2026-01-04 04:14:32','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 04:14:24','2026-01-04 04:32:35'),(11,'RET-2026-0011',6,7,'2026-01-04','erreur_commande','clôturé','2026-01-04 04:31:58','Admin','2026-01-04 04:32:00','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 04:31:54','2026-01-04 04:37:17'),(12,'RET-2026-0012',6,7,'2026-01-04','erreur_commande','clôturé','2026-01-04 04:38:44','Admin','2026-01-04 04:38:46','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 04:38:40','2026-01-04 04:45:29'),(13,'RET-2026-0013',7,1,'2026-01-04','erreur_commande','clôturé','2026-01-04 05:21:35','Admin','2026-01-04 05:21:37','Logistique',NULL,NULL,NULL,NULL,NULL,'2026-01-04 05:21:31','2026-01-04 05:21:41');
/*!40000 ALTER TABLE `retours` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-04  7:37:59
