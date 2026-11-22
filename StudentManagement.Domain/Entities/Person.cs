namespace StudentManagement.Domain.Entities
{
    public abstract class Person
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }

        public abstract string GetRole();
    }
}