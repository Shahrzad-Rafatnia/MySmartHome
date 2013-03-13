<?php namespace UASmartHome;

class Controller
{

    private $model;

    public function __construct() {
        $this->model = new Database\ResidentDB();
        $this->model->Connect();
    }

    public function getAchievements($resident_id) {

        $got_achiev = $this->model->Resident_DB_Earned_Achievement_2($resident_id);
        $all_achiev = $this->model->Resident_DB_Achievement();
        $achievements = array();

        foreach ($all_achiev as $achiev) {
            $has_achieved = False;
            $date_achieved = "";
            foreach ($got_achiev as $has) {
                if ($has["Name"] == $achiev["Name"]) {
                    $has_achieved = True;
                    $date_achieved = $has["Date_Earned"];
                    break;
                }
            }

            if ($has_achieved)
            {
                array_push($achievements,
                    new Achievement($achiev["Description"], True, "icons/" . $achiev["Enabled_Icon"], $date_achieved));
            }
            else
            {
                array_push($achievements,
                    new Achievement($achiev["Description"], False, "icons/" . $achiev["Disabled_Icon"], ""));

            }
        }

        return $achievements;

    }

    public function getScores($resident_id)
    {
        $residents = $this->model->Resident_DB_Get_All_Residents();
        $scores = array();
	$rank = 0;

        foreach ($residents as $resident) {
            $rank++;
            $data = $this->model->Resident_DB_Score($resident);

            array_push($scores, new Score($rank, $data["Score"]));
        }

        return $scores;
    }
}
