<?php namespace UASmartHome\Database\Configuration;

require_once __DIR__ . '/../../../../vendor/autoload.php';

class Constant {

    const INVALID_ID = -1;
    
    public $id;
    public $name;
    public $value;
    public $description;
    
    public function hasID()
    {
        return $this->id != Constant::INVALID_ID;
    }
    
    public function isValid()
    {
        if (empty($this->name))
            return false;
        
        if (!isset($this->value))
            return false;
        
        return true;
    }
}
