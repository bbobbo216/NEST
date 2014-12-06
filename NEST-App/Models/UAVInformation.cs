//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NEST_App.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class UAVInformation
    {
        public UAVInformation()
        {
            this.MapInfo = new HashSet<MapInformation>();
        }
    
        public int Id { get; set; }
        public string Position { get; set; }
        public string Timestamp { get; set; }
        public string VelocityX { get; set; }
        public string VelocityY { get; set; }
        public string VelocityZ { get; set; }
        public string Waypoint { get; set; }
        public string Path { get; set; }
        public string Origin { get; set; }
        public string Destination { get; set; }
    
        public virtual ICollection<MapInformation> MapInfo { get; set; }
    }
}