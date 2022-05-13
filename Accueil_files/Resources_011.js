﻿/**************************/
/*  Utility               */
/**************************/

var Utility = {

    // FindObject by name
    FindByName: function (Name, Object)
    {
        var element = null;
        if (typeof Object != "object") throw "object must be typeof object";
        for (var i = 0; i < Object.length; i++)
        {
            if (Object[i].hasOwnProperty("_Name") && Object[i]._Name == Name)
            {
                element = Object[i];
                break;
            }
        }
        return element;
    }
};