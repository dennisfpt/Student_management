using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class ClassSection
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Department { get; set; } = "";
        public string LecturerId { get; set; } = "";
        public string LecturerName { get; set; } = "";
        public int MaxCapacity { get; set; } = 30;
        public string Status { get; set; } = "Active";
    }
}
