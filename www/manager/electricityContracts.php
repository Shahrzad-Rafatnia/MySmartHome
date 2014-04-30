<?php namespace UASmartHome;

require_once __DIR__ . '/../vendor/autoload.php';

use \UASmartHome\Auth\Firewall;
Firewall::instance()->restrictAccess(Firewall::ROLE_MANAGER);

/* Setup Twig environment. */
$twig = \UASmartHome\TwigSingleton::getInstance();

/* Initialize all of these! */
$view = new \UASmartHome\ManagerView();

$contracts = $view->getUtilityContracts("Electricity");

echo $twig->render('manager/utilitycontracts.html',
	array('contracts' => $contracts));
