// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RWAContribution
 * @dev RWA星球GitHub贡献记录智能合约
 * 用于在FISCO BCOS联盟链上记录和验证用户的开源贡献
 */
contract RWAContribution {
    
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
    }
    
    // 项目信息结构体
    struct Project {
        uint256 id;                   // 项目ID
        string name;                  // 项目名称
        string githubRepo;            // GitHub仓库地址
        address manager;              // 项目管理员
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
    
    uint256 public contributionCounter;    // 贡献计数器
    uint256 public projectCounter;         // 项目计数器
    address public owner;                  // 合约所有者
    
    // 事件定义
    event ContributionRecorded(
        uint256 indexed contributionId,
        address indexed contributor,
        string githubUsername,
        uint256 indexed projectId,
        uint256 points,
        string contributionType
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
        address indexed manager
    );
    
    event ContributionVerified(
        uint256 indexed contributionId,
        address indexed verifier
    );
    
    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyProjectManager(uint256 _projectId) {
        require(
            msg.sender == owner || msg.sender == projects[_projectId].manager,
            "Only owner or project manager can call this function"
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
        owner = msg.sender;
        contributionCounter = 0;
        projectCounter = 0;
    }
    
    /**
     * @dev 创建新项目
     * @param _name 项目名称
     * @param _githubRepo GitHub仓库地址
     * @param _manager 项目管理员地址
     * @return 项目ID
     */
    function createProject(
        string memory _name,
        string memory _githubRepo,
        address _manager
    ) public onlyOwner returns (uint256) {
        projectCounter++;
        
        projects[projectCounter] = Project({
            id: projectCounter,
            name: _name,
            githubRepo: _githubRepo,
            manager: _manager,
            totalContributions: 0,
            totalPoints: 0,
            isActive: true
        });
        
        emit ProjectCreated(projectCounter, _name, _githubRepo, _manager);
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
            isActive: true
        });
        
        githubToAddress[_githubUsername] = msg.sender;
        
        emit ContributorRegistered(msg.sender, _githubUsername, _contributorType);
    }
    
    /**
     * @dev 记录贡献
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
    ) public onlyProjectManager(_projectId) validProject(_projectId) returns (uint256) {
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
            issueUrl: _issueUrl
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
            _contributionType
        );
        
        return contributionCounter;
    }
    
    /**
     * @dev 验证贡献
     * @param _contributionId 贡献ID
     */
    function verifyContribution(uint256 _contributionId) public onlyOwner {
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
     * @dev 更新项目状态
     * @param _projectId 项目ID
     * @param _isActive 是否活跃
     */
    function updateProjectStatus(uint256 _projectId, bool _isActive) 
        public onlyOwner {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        projects[_projectId].isActive = _isActive;
    }
    
    /**
     * @dev 转移所有权
     * @param _newOwner 新所有者地址
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
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
