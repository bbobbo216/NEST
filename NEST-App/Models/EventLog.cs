//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NEST_App.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class EventLog
    {
        public int event_id { get; set; }
        public System.DateTime create_date { get; set; }
        public System.DateTime modified_date { get; set; }
        public int uav_id { get; set; }
        public string message { get; set; }
        public string criticality { get; set; }
        public string uav_callsign { get; set; }
    }
}