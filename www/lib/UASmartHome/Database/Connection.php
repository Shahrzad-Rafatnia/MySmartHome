<?php namespace UASmartHome\Database;

class Connection {

    private $conn = null;

    public function Connect()
    {
        try {
            $this->conn= new \PDO(DB_TYPE.':host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS,
				    						array(\PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            $this->conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            //$this->conn->set_limit_time(60);
            $a="Connected Successfully";
            //echo $a ;
        }
        catch (\PDOException $e) {
            die('Failed to Connect' . $e->getMessage());
        }
        return $this->conn;
    }

}

