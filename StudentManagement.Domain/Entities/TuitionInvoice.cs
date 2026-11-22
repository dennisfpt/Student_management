using System;
using System.Collections.Generic;
using System.Text;

namespace StudentManagement.Domain.Entities
{
    public class TuitionInvoice
    {
            public string Id { get; set; } = "";
            public string StudentEmail { get; set; } = "ALL";
            public string Semester { get; set; } = "";
            public int Credits { get; set; }
            public decimal AmountVnd { get; set; }
            public string Note { get; set; } = "";
            public string BankCode { get; set; } = "MB";
            public string AccountNo { get; set; } = "0865156242";
            public string AccountName { get; set; } = "DUONG THI KIM YEN";
            public bool Paid { get; set; }
            public string CreatedAt { get; set; } = "";
            public string RecipientEmailsJson { get; set; } = "[]";
        
    }
}
