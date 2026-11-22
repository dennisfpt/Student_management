using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class StudentProfile
    {
        public string Email { get; set; } = "";
        public string StudentId { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Major { get; set; } = "";
        public string AvatarBase64 { get; set; } = "";
    }
}
