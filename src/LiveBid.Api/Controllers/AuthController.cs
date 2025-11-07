using LiveBid.Api.Models;
using LiveBid.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LiveBid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This will make the route '/api/auth'
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;

        // Inject the Identity services
        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
                              TokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        // --- REGISTER ENDPOINT ---
        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };

            // 'CreateAsync' hashes the password and saves the user
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                // If it failed (e.g., duplicate username), return the errors
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Registration successful" });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Find the user by their username
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            if (user == null)
            {
                return Unauthorized("Invalid username");
            }

            // Check if the password is correct
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Invalid password");
            }

            // If username and password are correct, create a token
            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user)
            };
        }
    }

    // --- DTOs (Data Transfer Objects) ---
    // We use these simple classes to define the
    // shape of the JSON we expect from the client.

    public class RegisterDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class UserDto
    {
        public string Username { get; set; }
        public string Token { get; set; }
    }
}