using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class ScholarshipAward
    {
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";
        public string Major { get; set; } = "";
        public string ClassId { get; set; } = "";
        public double Gpa { get; set; }
        public string Tier { get; set; } = "";
        public decimal WaiverAmountVnd { get; set; }
        public string AwardedAt { get; set; } = "";
    }
}
