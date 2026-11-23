import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";
import { PlayerService } from "./playerService";
import { SkillService } from "./skillService";
import { PlayerSkillService } from "./playerSkillService";
import { TeamService } from "./teamService";
import { PlayerContractService } from "./playerContractService";
import { PlayerProfileService } from "./playerProfileService";
import { TournamentService } from "./tournamentService";
import { RegistrationService } from "./registrationService";
import { PhaseService } from "./phaseService";
import { GroupService } from "./groupService";
import { FinalPhaseService } from "./finalPhaseService";
import { MatchService } from "./matchService";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { AzureOAuthProviderService } from "./azureOAuthProviderService";
import { GithubOAuthProviderService } from "./githubOAuthProviderService";
import { AuthService } from "./authService";

const googleOAuthProvider = new GoogleOAuthProviderService();
const azureOAuthProvider = new AzureOAuthProviderService();
const githubOAuthProvider = new GithubOAuthProviderService();

export const serviceContainer = {
  googleOAuthProvider,
  azureOAuthProvider,
  githubOAuthProvider,
  authService: new AuthService([
    googleOAuthProvider,
    azureOAuthProvider,
    githubOAuthProvider,
  ]),
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
  playerService: new PlayerService(),
  skillService: new SkillService(),
  playerSkillService: new PlayerSkillService(),
  teamService: new TeamService(),
  playerContractService: new PlayerContractService(),
  playerProfileService: new PlayerProfileService(),
  tournamentService: new TournamentService(),
  registrationService: new RegistrationService(),
  phaseService: new PhaseService(),
  groupService: new GroupService(),
  finalPhaseService: new FinalPhaseService(),
  matchService: new MatchService(),
};

export type ServiceContainer = typeof serviceContainer;
