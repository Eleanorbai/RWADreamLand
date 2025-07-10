// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RWAContribution
 * @dev RWA星球GitHub贡献记录智能合约
 * 用于在FISCO BCOS联盟链上记录和验证用户的开源贡献
 * 支持多角色权限管理：平台admin、项目owner、项目admin、白名单
 */
contract RWAPlatformContribution {
    
    // 角色枚举
    enum Role {
        NONE,           // 无权限
        PLATFORM_ADMIN, // 平台管理员
        PROJECT_OWNER,  // 项目所有者
        PROJECT_ADMIN,  // 项目管理员
        WHITELIST       // 白名单成员
    }
    
    // 贡献记录结构体
    struct Contribution {
        uint256 id;                    // 贡献ID
        address contributor;           // 贡献者地址
        string githubUsername;         // GitHub用户名
        string projectName;            // 项目名称
        uint256 issueNumber;          // Issue编号
        string contributionType;       // 贡献类型
        uint256 points;               // 获得积分
        uint256 timestamp;            // 记录时间
        bool isVerified;              // 是否已验证
        string issueTitle;            // Issue标题
        string issueUrl;              // Issue链接
        address recordedBy;           // 记录人地址
    }
    
    // 贡献者信息结构体
    struct Contributor {
        address addr;                  // 贡献者地址
        string githubUsername;         // GitHub用户名
        string contributorType;        // 贡献者类型(个人/企业)
        string organizationName;       // 组织名称
        uint256 totalContributions;   // 总贡献数
        uint256 totalPoints;          // 总积分
        uint256 reputationScore;      // 声誉分数
        bool isActive;                // 是否活跃
        bool isWhitelisted;           // 是否在白名单中
    }
    
    // 项目信息结构体
    struct Project {
        uint256 id;                   // 项目ID
        string name;                  // 项目名称
        string githubRepo;            // GitHub仓库地址
        address owner;                // 项目所有者
        address admin;                // 项目管理员
        uint256 totalContributions;  // 总贡献数
        uint256 totalPoints;         // 总积分分发
        bool isActive;               // 是否活跃
    }
    
    // 状态变量
    mapping(uint256 => Contribution) public contributions;           // 贡献记录映射
    mapping(address => Contributor) public contributors;             // 贡献者映射
    mapping(uint256 => Project) public projects;                    // 项目映射
    mapping(address => uint256[]) public contributorToContributions; // 贡献者的贡献列表
    mapping(uint256 => uint256[]) public projectToContributions;    // 项目的贡献列表
    mapping(string => address) public githubToAddress;              // GitHub用户名到地址映射
    
    // 权限管理
    mapping(address => Role) public userRoles;                      // 用户角色映射
    mapping(address => bool) public whitelist;                      // 白名单映射
    mapping(uint256 => mapping(address => Role)) public projectRoles; // 项目内用户角色映射
    
    uint256 public contributionCounter;    // 贡献计数器
    uint256 public projectCounter;         // 项目计数器
    address public platformAdmin;          // 平台管理员
    
    // 事件定义
    event ContributionRecorded(
        uint256 indexed contributionId,
        address indexed contributor,
        string githubUsername,
        uint256 indexed projectId,
        uint256 points,
        string contributionType,
        address recordedBy
    );
    
    event ContributorRegistered(
        address indexed contributor,
        string githubUsername,
        string contributorType
    );
    
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        string githubRepo,
        address indexed owner,
        address admin
    );
    
    event ContributionVerified(
        uint256 indexed contributionId,
        address indexed verifier
    );
    
    event RoleAssigned(
        address indexed user,
        Role role,
        uint256 indexed projectId
    );
    
    event WhitelistUpdated(
        address indexed user,
        bool isWhitelisted
    );
    
    // 修饰符
    modifier onlyPlatformAdmin() {
        require(userRoles[msg.sender] == Role.PLATFORM_ADMIN, "Only platform admin can call this function");
        _;
    }
    
    modifier onlyProjectOwner(uint256 _projectId) {
        require(
            userRoles[msg.sender] == Role.PLATFORM_ADMIN || 
            projects[_projectId].owner == msg.sender,
            "Only platform admin or project owner can call this function"
        );
        _;
    }
    
    modifier onlyProjectAdmin(uint256 _projectId) {
        require(
            userRoles[msg.sender] == Role.PLATFORM_ADMIN || 
            projects[_projectId].owner == msg.sender ||
            projects[_projectId].admin == msg.sender ||
            projectRoles[_projectId][msg.sender] == Role.PROJECT_ADMIN,
            "Only platform admin, project owner, or project admin can call this function"
        );
        _;
    }
    
    modifier onlyAuthorized(uint256 _projectId) {
        require(
            userRoles[msg.sender] == Role.PLATFORM_ADMIN || 
            projects[_projectId].owner == msg.sender ||
            projects[_projectId].admin == msg.sender ||
            projectRoles[_projectId][msg.sender] == Role.PROJECT_ADMIN ||
            whitelist[msg.sender] ||
            projectRoles[_projectId][msg.sender] == Role.WHITELIST,
            "Only authorized users can call this function"
        );
        _;
    }
    
    modifier validProject(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        require(projects[_projectId].isActive, "Project is not active");
        _;
    }
    
    // 构造函数
    constructor() {
        platformAdmin = msg.sender;
        userRoles[msg.sender] = Role.PLATFORM_ADMIN;
        contributionCounter = 0;
        projectCounter = 0;
    }
    
    /**
     * @dev 分配用户角色
     * @param _user 用户地址
     * @param _role 角色
     * @param _projectId 项目ID（可选，仅用于项目内角色）
     */
    function assignRole(address _user, Role _role, uint256 _projectId) public onlyPlatformAdmin {
        if (_projectId > 0) {
            require(_projectId <= projectCounter, "Invalid project ID");
            projectRoles[_projectId][_user] = _role;
            emit RoleAssigned(_user, _role, _projectId);
        } else {
            userRoles[_user] = _role;
            emit RoleAssigned(_user, _role, 0);
        }
    }
    
    /**
     * @dev 更新白名单
     * @param _user 用户地址
     * @param _isWhitelisted 是否加入白名单
     */
    function updateWhitelist(address _user, bool _isWhitelisted) public onlyPlatformAdmin {
        whitelist[_user] = _isWhitelisted;
        if (contributors[_user].addr != address(0)) {
            contributors[_user].isWhitelisted = _isWhitelisted;
        }
        emit WhitelistUpdated(_user, _isWhitelisted);
    }
    
    /**
     * @dev 创建新项目
     * @param _name 项目名称
     * @param _githubRepo GitHub仓库地址
     * @param _owner 项目所有者地址
     * @param _admin 项目管理员地址
     * @return 项目ID
     */
    function createProject(
        string memory _name,
        string memory _githubRepo,
        address _owner,
        address _admin
    ) public onlyPlatformAdmin returns (uint256) {
        projectCounter++;
        
        projects[projectCounter] = Project({
            id: projectCounter,
            name: _name,
            githubRepo: _githubRepo,
            owner: _owner,
            admin: _admin,
            totalContributions: 0,
            totalPoints: 0,
            isActive: true
        });
        
        // 自动分配项目角色
        projectRoles[projectCounter][_owner] = Role.PROJECT_OWNER;
        projectRoles[projectCounter][_admin] = Role.PROJECT_ADMIN;
        
        emit ProjectCreated(projectCounter, _name, _githubRepo, _owner, _admin);
        return projectCounter;
    }
    
    /**
     * @dev 注册贡献者
     * @param _githubUsername GitHub用户名
     * @param _contributorType 贡献者类型
     * @param _organizationName 组织名称
     */
    function registerContributor(
        string memory _githubUsername,
        string memory _contributorType,
        string memory _organizationName
    ) public {
        require(bytes(_githubUsername).length > 0, "GitHub username cannot be empty");
        require(contributors[msg.sender].addr == address(0), "Contributor already registered");
        
        contributors[msg.sender] = Contributor({
            addr: msg.sender,
            githubUsername: _githubUsername,
            contributorType: _contributorType,
            organizationName: _organizationName,
            totalContributions: 0,
            totalPoints: 0,
            reputationScore: 0,
            isActive: true,
            isWhitelisted: whitelist[msg.sender]
        });
        
        githubToAddress[_githubUsername] = msg.sender;
        
        emit ContributorRegistered(msg.sender, _githubUsername, _contributorType);
    }
    
    /**
     * @dev 记录贡献（权限控制版本）
     * @param _contributor 贡献者地址
     * @param _githubUsername GitHub用户名
     * @param _projectId 项目ID
     * @param _issueNumber Issue编号
     * @param _contributionType 贡献类型
     * @param _points 积分
     * @param _issueTitle Issue标题
     * @param _issueUrl Issue链接
     * @return 贡献ID
     */
    function recordContribution(
        address _contributor,
        string memory _githubUsername,
        uint256 _projectId,
        uint256 _issueNumber,
        string memory _contributionType,
        uint256 _points,
        string memory _issueTitle,
        string memory _issueUrl
    ) public onlyAuthorized(_projectId) validProject(_projectId) returns (uint256) {
        contributionCounter++;
        
        contributions[contributionCounter] = Contribution({
            id: contributionCounter,
            contributor: _contributor,
            githubUsername: _githubUsername,
            projectName: projects[_projectId].name,
            issueNumber: _issueNumber,
            contributionType: _contributionType,
            points: _points,
            timestamp: block.timestamp,
            isVerified: false,
            issueTitle: _issueTitle,
            issueUrl: _issueUrl,
            recordedBy: msg.sender
        });
        
        // 更新映射关系
        contributorToContributions[_contributor].push(contributionCounter);
        projectToContributions[_projectId].push(contributionCounter);
        
        // 更新项目统计
        projects[_projectId].totalContributions++;
        projects[_projectId].totalPoints += _points;
        
        // 如果贡献者已注册，更新其统计信息
        if (contributors[_contributor].addr != address(0)) {
            contributors[_contributor].totalContributions++;
            contributors[_contributor].totalPoints += _points;
            // 简单的声誉计算：总积分 * 0.6 + 贡献数量 * 0.4
            contributors[_contributor].reputationScore = 
                contributors[_contributor].totalPoints * 60 / 100 + 
                contributors[_contributor].totalContributions * 40 / 100;
        }
        
        emit ContributionRecorded(
            contributionCounter,
            _contributor,
            _githubUsername,
            _projectId,
            _points,
            _contributionType,
            msg.sender
        );
        
        return contributionCounter;
    }
    
    /**
     * @dev 验证贡献
     * @param _contributionId 贡献ID
     */
    function verifyContribution(uint256 _contributionId) public onlyPlatformAdmin {
        require(_contributionId > 0 && _contributionId <= contributionCounter, "Invalid contribution ID");
        require(!contributions[_contributionId].isVerified, "Contribution already verified");
        
        contributions[_contributionId].isVerified = true;
        
        emit ContributionVerified(_contributionId, msg.sender);
    }
    
    /**
     * @dev 获取贡献者的贡献列表
     * @param _contributor 贡献者地址
     * @return 贡献ID数组
     */
    function getContributorContributions(address _contributor) 
        public view returns (uint256[] memory) {
        return contributorToContributions[_contributor];
    }
    
    /**
     * @dev 获取项目的贡献列表
     * @param _projectId 项目ID
     * @return 贡献ID数组
     */
    function getProjectContributions(uint256 _projectId) 
        public view returns (uint256[] memory) {
        return projectToContributions[_projectId];
    }
    
    /**
     * @dev 根据GitHub用户名获取贡献者地址
     * @param _githubUsername GitHub用户名
     * @return 贡献者地址
     */
    function getContributorByGithub(string memory _githubUsername) 
        public view returns (address) {
        return githubToAddress[_githubUsername];
    }
    
    /**
     * @dev 获取贡献详情
     * @param _contributionId 贡献ID
     * @return 贡献结构体
     */
    function getContribution(uint256 _contributionId) 
        public view returns (Contribution memory) {
        require(_contributionId > 0 && _contributionId <= contributionCounter, "Invalid contribution ID");
        return contributions[_contributionId];
    }
    
    /**
     * @dev 获取贡献者详情
     * @param _contributor 贡献者地址
     * @return 贡献者结构体
     */
    function getContributor(address _contributor) 
        public view returns (Contributor memory) {
        return contributors[_contributor];
    }
    
    /**
     * @dev 获取项目详情
     * @param _projectId 项目ID
     * @return 项目结构体
     */
    function getProject(uint256 _projectId) 
        public view returns (Project memory) {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        return projects[_projectId];
    }
    
    /**
     * @dev 检查用户权限
     * @param _user 用户地址
     * @param _projectId 项目ID
     * @return 用户角色
     */
    function getUserRole(address _user, uint256 _projectId) 
        public view returns (Role) {
        // 平台管理员最高权限
        if (userRoles[_user] == Role.PLATFORM_ADMIN) {
            return Role.PLATFORM_ADMIN;
        }
        
        // 项目内角色
        if (_projectId > 0 && _projectId <= projectCounter) {
            Role projectRole = projectRoles[_projectId][_user];
            if (projectRole != Role.NONE) {
                return projectRole;
            }
            
            // 检查是否为项目所有者或管理员
            if (projects[_projectId].owner == _user) {
                return Role.PROJECT_OWNER;
            }
            if (projects[_projectId].admin == _user) {
                return Role.PROJECT_ADMIN;
            }
        }
        
        // 检查白名单
        if (whitelist[_user]) {
            return Role.WHITELIST;
        }
        
        return Role.NONE;
    }
    
    /**
     * @dev 更新项目状态
     * @param _projectId 项目ID
     * @param _isActive 是否活跃
     */
    function updateProjectStatus(uint256 _projectId, bool _isActive) 
        public onlyProjectOwner(_projectId) {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        projects[_projectId].isActive = _isActive;
    }
    
    /**
     * @dev 转移平台管理员权限
     * @param _newAdmin 新管理员地址
     */
    function transferPlatformAdmin(address _newAdmin) public onlyPlatformAdmin {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        platformAdmin = _newAdmin;
        userRoles[_newAdmin] = Role.PLATFORM_ADMIN;
        userRoles[msg.sender] = Role.NONE;
    }
    
    /**
     * @dev 获取总贡献数
     * @return 总贡献数
     */
    function getTotalContributions() public view returns (uint256) {
        return contributionCounter;
    }
    
    /**
     * @dev 获取总项目数
     * @return 总项目数
     */
    function getTotalProjects() public view returns (uint256) {
        return projectCounter;
    }
}
