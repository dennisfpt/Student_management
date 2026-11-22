using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class AttendanceSummary
    {
        public int Id { get; set; }
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";
        public string ClassId { get; set; } = "";
        public int TotalSessions { get; set; } = 15;
        public int AttendedSessions { get; set; } = 15;
        public int AbsentSessions { get; set; } = 0;
        public string UpdatedBy { get; set; } = "";
        public string UpdatedAt { get; set; } = "";
    }
}
