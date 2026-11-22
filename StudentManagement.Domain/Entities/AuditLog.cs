using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class AuditLog
    {
        public string Id { get; set; } = "";
        public string Actor { get; set; } = "";
        public string Action { get; set; } = "";
        public string Target { get; set; } = "";
        public string Detail { get; set; } = "";
        public string Timestamp { get; set; } = "";
    }
}
