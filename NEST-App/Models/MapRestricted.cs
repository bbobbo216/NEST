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
    
    public partial class MapRestricted
    {
        public int Id { get; set; }
        public System.Data.Entity.Spatial.DbGeography Ellipse_center_coordinates { get; set; }
        public double Ellipse_NorthAxis { get; set; }
        public double Ellipse_EastAxis { get; set; }
        public double PopulationDensity { get; set; }
        public double SeaLevel { get; set; }
        public string Creator_created { get; set; }
        public System.DateTime Time_created { get; set; }
        public string Reason_created { get; set; }
        public bool Warning { get; set; }
    }
}