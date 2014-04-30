<?php

///
/// Renders the configuration page for inserting and editing new functions and constants
///

require_once __DIR__ . '/../vendor/autoload.php';

use \UASmartHome\Auth\Firewall;
Firewall::instance()->restrictAccess(Firewall::ROLE_ENGINEER);

use \UASmartHome\Database\Configuration\ConfigurationDB;

$configData = ConfigurationDB::fetchConfigData();

$twig = \UASmartHome\TwigSingleton::getInstance();
echo $twig->render('engineer/configuration.html', array(
    "configData" => $configData
));

