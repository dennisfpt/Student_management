using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class Announcement
    {
        public string Id { get; set; } = "";
        public string Category { get; set; } = "Academic";
        public string TargetGroup { get; set; } = "ALL";
        public string TargetClassIdsJson { get; set; } = "[]";
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string InvoiceId { get; set; } = "";
        public decimal AmountVnd { get; set; }
        public string CreatedAt { get; set; } = "";
    }
}
