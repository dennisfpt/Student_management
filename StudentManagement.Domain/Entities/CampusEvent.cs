using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class CampusEvent
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string Organizer { get; set; } = "";
        public string EventDate { get; set; } = "";
        public string Venue { get; set; } = "";
        public int ConductPoints { get; set; } = 5;
        public string Status { get; set; } = "Upcoming";
        public string AttendeesJson { get; set; } = "[]";
    }
}
