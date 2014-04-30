<?php

ini_set('display_errors', 0); // Allows PHP to return response 500 on errors

require_once __DIR__ . '/../vendor/autoload.php';

use \UASmartHome\Auth\Firewall;
Firewall::instance()->restrictAccess(Firewall::ROLE_ENGINEER, Firewall::ROLE_MANAGER);

use \UASmartHome\Database\Configuration\ConfigurationDB;

header('Content-Type: application/json; charset=utf-8');

$configData = ConfigurationDB::fetchConfigData();

$jsonConfigData = json_encode($configData);

echo $jsonConfigData;

die;
