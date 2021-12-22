-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Dic 22, 2021 alle 12:42
-- Versione del server: 10.4.21-MariaDB
-- Versione PHP: 8.0.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `book&party`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `prenotazione_tipologia_locale`
--

CREATE TABLE `prenotazione_tipologia_locale` (
  `id_prenotazione` int(11) NOT NULL,
  `id_locale` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_tipologia` int(11) NOT NULL,
  `data_prenotazione` date NOT NULL,
  `quantita` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `prenotazione_tipologia_locale`
--

INSERT INTO `prenotazione_tipologia_locale` (`id_prenotazione`, `id_locale`, `id_cliente`, `id_tipologia`, `data_prenotazione`, `quantita`) VALUES
(2, 1, 1, 1, '2021-12-02', 5),
(3, 6, 2, 11, '2021-12-08', 5),
(4, 6, 2, 15, '2021-12-30', 2),
(5, 2, 2, 13, '2021-12-25', 8),
(6, 1, 3, 17, '2022-01-19', 4),
(7, 2, 3, 12, '2021-12-31', 10),
(8, 1, 4, 1, '2022-02-23', 4),
(9, 6, 4, 11, '2021-12-29', 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `servizi`
--

CREATE TABLE `servizi` (
  `id_servizi` int(11) NOT NULL,
  `id_tipologia` int(11) NOT NULL,
  `tipo_servizio` varchar(30) NOT NULL,
  `prezzo_servizio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `servizi`
--

INSERT INTO `servizi` (`id_servizi`, `id_tipologia`, `tipo_servizio`, `prezzo_servizio`) VALUES
(1, 8, 'Catering', 50),
(2, 8, 'DJ', 30),
(4, 12, 'Catering', 110),
(5, 11, 'Impianto audio', 7),
(9, 13, 'Catering', 28),
(10, 1, 'Catering', 35),
(22, 1, 'Impianto audio', 15),
(23, 5, 'Impianto audio', 20),
(24, 5, 'Catering', 35),
(25, 15, 'DJ', 40),
(26, 17, 'Catering', 11),
(27, 17, 'DJ', 20);

-- --------------------------------------------------------

--
-- Struttura della tabella `tipologia`
--

CREATE TABLE `tipologia` (
  `id_tipologia` int(11) NOT NULL,
  `id_locale` int(11) NOT NULL,
  `nome_tipologia` varchar(30) NOT NULL,
  `quantita` int(11) NOT NULL,
  `costo` int(11) NOT NULL,
  `numero_massimo_persone` int(11) NOT NULL,
  `foto` varchar(100) NOT NULL,
  `zona_aperta` tinyint(1) NOT NULL,
  `isGestore` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `tipologia`
--

INSERT INTO `tipologia` (`id_tipologia`, `id_locale`, `nome_tipologia`, `quantita`, `costo`, `numero_massimo_persone`, `foto`, `zona_aperta`, `isGestore`) VALUES
(1, 1, 'Sala Ballo', 2, 40, 9, '', 1, 0),
(5, 1, 'Tavolo', 5, 12, 12, '', 1, 0),
(8, 5, 'Tavolo', 4, 25, 9, '', 1, 0),
(11, 6, 'Tavolo', 3, 13, 6, '', 0, 0),
(12, 5, 'Sala Ballo', 2, 45, 10, '', 0, 0),
(13, 1, 'Karaoke', 3, 35, 8, '', 1, 0),
(14, 2, 'Tavolo', 1, 12, 2, '', 0, 1),
(15, 2, 'Sala Ballo', 3, 20, 2, '', 1, 0),
(16, 6, 'Sala Ballo', 4, 35, 3, '', 0, 0),
(17, 6, 'Karaoke', 1, 50, 5, '', 1, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

CREATE TABLE `utente` (
  `id_utente` int(11) NOT NULL,
  `nome` varchar(20) NOT NULL,
  `cognome` varchar(20) NOT NULL,
  `data_di_nascita` date NOT NULL,
  `email` varchar(30) NOT NULL,
  `numero_telefono` varchar(10) NOT NULL,
  `password` varchar(30) NOT NULL,
  `isTipoGestore` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `utente`
--

INSERT INTO `utente` (`id_utente`, `nome`, `cognome`, `data_di_nascita`, `email`, `numero_telefono`, `password`, `isTipoGestore`) VALUES
(1, 'Gino', 'Peppino', '2001-01-01', 'gino@gmail.com', '3546873335', '1234', 0),
(2, 'Max', 'Mariola', '1991-10-05', 'mario@gmail.com', '4985647152', '123', 1),
(3, 'Filiberto', 'Romano', '1970-02-13', 'filibero@gmail.com', '335714259', 'fili', 0),
(4, 'Cristiano', 'Ricci', '1988-08-08', 'ricci@gmail.com', '4566632155', 'cristiano88', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `utente_locale`
--

CREATE TABLE `utente_locale` (
  `id_locale` int(11) NOT NULL,
  `id_gestore` int(11) NOT NULL,
  `nome_locale` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  `numero_telefono` varchar(10) NOT NULL,
  `citta` varchar(30) NOT NULL,
  `indirizzo_locale` varchar(30) NOT NULL,
  `descrizione` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `utente_locale`
--

INSERT INTO `utente_locale` (`id_locale`, `id_gestore`, `nome_locale`, `email`, `password`, `numero_telefono`, `citta`, `indirizzo_locale`, `descrizione`) VALUES
(1, 1, 'La Cucaracha Club', 'cucaracha@gmail.com', 'password', '4341278845', 'Nogara', 'Via C.A. Dalla Chiesa', 'Nome assurdo per un locale notturno ma almeno è carino l\'interno. Belli gli arredamenti'),
(2, 1, 'Pub Enigma', 'enigma@gmail.com', 'amgine', '4563547871', 'Carpi', 'Via Carlo Marx', 'Bel giardino, grande parcheggio. Ottimo posto per passare la serata.'),
(5, 2, 'Fantasy Disco', 'fantasy@gmail.com', 'perp', '5647899852', 'Grosseto', 'Via Siria', 'Buonissimi cocktail, bella musica e soprattutto intrattenimento assicurato.'),
(6, 2, 'Crazy Bar', 'crazy@gmail.com', 'loco', '5647899852', 'Ponte Nizza', 'Via Della Stazione', 'W o W');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `prenotazione_tipologia_locale`
--
ALTER TABLE `prenotazione_tipologia_locale`
  ADD PRIMARY KEY (`id_prenotazione`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_locale` (`id_locale`),
  ADD KEY `id_tipologia` (`id_tipologia`);

--
-- Indici per le tabelle `servizi`
--
ALTER TABLE `servizi`
  ADD PRIMARY KEY (`id_servizi`),
  ADD KEY `id_tipologia` (`id_tipologia`);

--
-- Indici per le tabelle `tipologia`
--
ALTER TABLE `tipologia`
  ADD PRIMARY KEY (`id_tipologia`),
  ADD KEY `id_locale` (`id_locale`);

--
-- Indici per le tabelle `utente`
--
ALTER TABLE `utente`
  ADD PRIMARY KEY (`id_utente`);

--
-- Indici per le tabelle `utente_locale`
--
ALTER TABLE `utente_locale`
  ADD PRIMARY KEY (`id_locale`),
  ADD KEY `id_utente` (`id_gestore`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `prenotazione_tipologia_locale`
--
ALTER TABLE `prenotazione_tipologia_locale`
  MODIFY `id_prenotazione` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=348;

--
-- AUTO_INCREMENT per la tabella `servizi`
--
ALTER TABLE `servizi`
  MODIFY `id_servizi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT per la tabella `tipologia`
--
ALTER TABLE `tipologia`
  MODIFY `id_tipologia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `utente`
--
ALTER TABLE `utente`
  MODIFY `id_utente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `utente_locale`
--
ALTER TABLE `utente_locale`
  MODIFY `id_locale` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `prenotazione_tipologia_locale`
--
ALTER TABLE `prenotazione_tipologia_locale`
  ADD CONSTRAINT `prenotazione_tipologia_locale_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE,
  ADD CONSTRAINT `prenotazione_tipologia_locale_ibfk_2` FOREIGN KEY (`id_locale`) REFERENCES `utente_locale` (`id_locale`) ON DELETE CASCADE,
  ADD CONSTRAINT `prenotazione_tipologia_locale_ibfk_3` FOREIGN KEY (`id_tipologia`) REFERENCES `tipologia` (`id_tipologia`) ON DELETE CASCADE;

--
-- Limiti per la tabella `servizi`
--
ALTER TABLE `servizi`
  ADD CONSTRAINT `servizi_ibfk_1` FOREIGN KEY (`id_tipologia`) REFERENCES `tipologia` (`id_tipologia`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tipologia`
--
ALTER TABLE `tipologia`
  ADD CONSTRAINT `tipologia_ibfk_1` FOREIGN KEY (`id_locale`) REFERENCES `utente_locale` (`id_locale`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utente_locale`
--
ALTER TABLE `utente_locale`
  ADD CONSTRAINT `utente_locale_ibfk_1` FOREIGN KEY (`id_gestore`) REFERENCES `utente` (`id_utente`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
