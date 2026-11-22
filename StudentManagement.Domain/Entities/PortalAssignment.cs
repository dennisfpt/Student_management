using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class PortalAssignment
    {
        public string Id { get; set; } = "";
        public string ClassId { get; set; } = "";
        public string CourseName { get; set; } = "";
        public string LecturerName { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string DueDate { get; set; } = "";
        public string CreatedAt { get; set; } = "";
        public string SubmissionsJson { get; set; } = "[]";
    }
}
