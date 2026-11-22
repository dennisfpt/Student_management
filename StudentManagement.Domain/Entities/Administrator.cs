namespace StudentManagement.Domain.Entities
{
    public class Administrator : Person
    {
        public string Department { get; set; } = string.Empty;

        public override string GetRole() => "Administrator";
    }
}