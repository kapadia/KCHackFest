// 		JDCT    Epoch Julian Date, Coordinate Time
//       EC     Eccentricity, e                                                   
//       QR     Periapsis distance, q (AU)                                        
//       IN     Inclination w.r.t xy-plane, i (degrees)                           
//       OM     Longitude of Ascending Node, OMEGA, (degrees)                     
//       W      Argument of Perifocus, w (degrees)                                
//       Tp     Time of periapsis (Julian day number)                             
//       N      Mean motion, n (degrees/day)                                      
//       MA     Mean anomaly, M (degrees)                                         
//       TA     True anomaly, nu (degrees)                                        
//       A      Semi-major axis, a (AU)                                           
//       AD     Apoapsis distance (AU)                                            
//       PR     Sidereal orbit period (day) 
var planet_init_list = [
	{ planetName:"Sol", color:0xfff5ec, width: 50, planetOrder:0, satelliteOf:"-1", scale_mult:"1 1 1", orbit_calc_method:"star", dist_from_parent:0, orbit_sidereal_in_days:0, diameter_km:1392000, diameter_sqrtln:7.072, obliquity:0, rotation_sidereal_in_days:0, a_semimajor_axis:0, e_eccentricity:0, i_inclination:0, O_perihelion:0, w_ecliptic_long:0, L_mean_anomaly:0, a_per_cy:0, e_per_cy:0, i_per_cy:0, O_per_cy:0, w_per_cy:0, L_per_cy:0},
	{ planetName:"Mercury", color:0xf37e1a, width: 10, planetOrder:1, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:57900000, orbit_sidereal_in_days:88, rotation_sidereal_in_days:58.6467, diameter_km:4879, diameter_sqrtln:4.246, obliquity:0.01,  a_semimajor_axis:0.38709893, e_eccentricity:0.20563069, i_inclination:7.00487, O_ecliptic_long:48.33167, w_perihelion:77.45645, L_mean_longitude:252.25084, a_per_cy:0.00000066, e_per_cy:0.00002527, i_per_cy:-23.51, O_per_cy:-446.30, w_per_cy:573.57, L_per_cy:538101628.29}, 
	{ planetName:"Venus", color:0xe07749, width: 10, planetOrder:2, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:108200000, orbit_sidereal_in_days:225, rotation_sidereal_in_days:-243.02, diameter_km:12104, diameter_sqrtln:4.701, obliquity:177.4, a_semimajor_axis:0.72333199, e_eccentricity:0.00677323, i_inclination:3.39471, O_ecliptic_long:76.68069, w_perihelion:131.53298, L_mean_longitude:181.97973, a_per_cy:0.00000092, e_per_cy:-0.00004938, i_per_cy:-2.86, O_per_cy:-996.89, w_per_cy:-108.80, L_per_cy:210664136.06}, 
	{ planetName:"Earth", 
		color: 0x345374, 
		width: 10, 
		planetOrder: 3, 
		satelliteOf: "Sol", 
		scale_mult: "1 1 1", 
		orbit_calc_method: "major_planet", 
		dist_from_parent: 149600000, 
		orbit_sidereal_in_days: 365.26, 
		rotation_sidereal_in_days: 1, 
		diameter_km: 12756, 
		diameter_sqrtln: 4.727, 
		obliquity: 23.439, 
		a_semimajor_axis: 1.00000011, 
		e_eccentricity: 0.01671022, 
		i_inclination: 0.00005, 
		O_ecliptic_long: -11.26064, 
		w_perihelion: 102.94719, 
		L_mean_longitude: 100.46435, 
		a_per_cy: -0.00000005, 
		e_per_cy: -0.00003804, 
		i_per_cy: -46.94, 
		O_per_cy: -18228.25, 
		w_per_cy: 1198.28, 
		L_per_cy: 129597740.63
	}, 
	{ planetName:"Mars", color:0xae763e, width: 10, planetOrder:4, satelliteOf:"Sol", scale_mult:"1 1 1",orbit_calc_method:"major_planet", dist_from_parent:227900000, orbit_sidereal_in_days:693.99, rotation_sidereal_in_days:24.62326, diameter_km:6794, diameter_sqrtln:4.412, obliquity:1.5424, a_semimajor_axis:1.52366231, e_eccentricity:0.09341233, i_inclination:1.85061, O_ecliptic_long:49.57854, w_perihelion:336.04084, L_mean_longitude:355.45332, a_per_cy:-0.00007221, e_per_cy:0.00011902, i_per_cy:-25.47, O_per_cy:-1020.19, w_per_cy:1560.78, L_per_cy:68905103.78}, 
	{ planetName:"Jupiter", color:0xf28951, width: 10, planetOrder:5, satelliteOf:"Sol", scale_mult:"1 1 0.92", orbit_calc_method:"major_planet", dist_from_parent:778400000, orbit_sidereal_in_days:4346.59, rotation_sidereal_in_days:0.38451, diameter_km:142984, diameter_sqrtln:5.935, obliquity:3.13, a_semimajor_axis:5.20336301, e_eccentricity:0.04839266, i_inclination:1.30530, O_ecliptic_long:100.55615, w_perihelion:14.75385, L_mean_longitude:34.40438, a_per_cy:0.00060737, e_per_cy:-0.00012880, i_per_cy:-4.15, O_per_cy:1217.17, w_per_cy:839.93, L_per_cy:10925078.35}, 
	{ planetName:"Saturn", color:0xdeb078, width: 10, planetOrder:6, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:1400000000, orbit_sidereal_in_days:10775.17, rotation_sidereal_in_days:0.43929, diameter_km:120536, diameter_sqrtln:5.85, obliquity:26.73, a_semimajor_axis:9.53707032, e_eccentricity:0.05415060, i_inclination:2.48446, O_ecliptic_long:113.71504, w_perihelion:92.43194, L_mean_longitude:49.94432, a_per_cy:-0.00301530, e_per_cy:-0.00036762, i_per_cy:6.11, O_per_cy:-1591.05, w_per_cy:-1948.89, L_per_cy:4401052.95}, 
	{ planetName:"Uranus", color:0x9cb8c3, width: 10, planetOrder:7, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:2870000000, orbit_sidereal_in_days:30681.84, rotation_sidereal_in_days:-0.7183333, diameter_km:51118, diameter_sqrtln:5.421, obliquity:97.77, a_semimajor_axis:19.19126393, e_eccentricity:0.04716771, i_inclination:0.76986, O_ecliptic_long:74.22988, w_perihelion:170.96424, L_mean_longitude:313.23218, a_per_cy:0.00152025, e_per_cy:-0.00019150, i_per_cy:-2.09, O_per_cy:-1681.40, w_per_cy:1312.56, L_per_cy:1542547.79}, 
	{ planetName:"Neptune", color:0x6086e5, width: 10, planetOrder:8, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:4500000000, orbit_sidereal_in_days:60194.85, rotation_sidereal_in_days:0.67125, diameter_km:49528, diameter_sqrtln:5.405, obliquity:28.32, a_semimajor_axis:30.06896348, e_eccentricity:0.00858587, i_inclination:1.76917, O_ecliptic_long:131.72169, w_perihelion:44.97135, L_mean_longitude:304.88003, a_per_cy:-0.00125196, e_per_cy:0.00002510, i_per_cy:-3.64, O_per_cy:-151.25, w_per_cy:-844.43, L_per_cy:786449.21}, 
	{ planetName:"Pluto", color:0x9fa9b2, width: 10, planetOrder:9, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:5900000000, orbit_sidereal_in_days:90767.11, rotation_sidereal_in_days:-0.2564537, diameter_km:2302, diameter_sqrtln:3.871, obliquity:119.61, a_semimajor_axis:39.48168677, e_eccentricity:0.24880766, i_inclination:17.14175, O_ecliptic_long:110.30347, w_perihelion:224.06676, L_mean_longitude:238.92881, a_per_cy:-0.00076912, e_per_cy:0.00006465, i_per_cy:11.07, O_per_cy:-37.33, w_per_cy:-132.25, L_per_cy:522747.90},

	{ planetName:"Luna", color:0xa6a6a6, width: 10, planetOrder:1, satelliteOf:"Earth", shapeName:"art/shapes/planets/luna.dts", scale_mult:"1 1 1", orbit_calc_method:"luna", orbit_sidereal_in_days:27.39677, rotation_sidereal_in_days:1.13841, diameter_km:3476, obliquity:6.68, DB:"PlanetDBLuna", N_long_asc:125.1228, i_inclination:5.1454, w_arg_perigee:318.0634, a_mean_dist:0.00384399, e_eccentricity:0.054900, M_mean_anomaly:115.3654, N_per_cy:-0.0529538083, w_per_cy:0.1643573223, m_per_cy:13.0649929509 }
];

var ephemeris = [
	{
		name: 'Sun',
		texture: './images/solarsystem/sunmap.jpg',
		size: 1392684
	},{
		name: 'Mercury',
		texture: './images/solarsystem/mercurymap.jpg',
		size: 2439.7,
		period: 87.96926,
		a: [ 0.38709843, 0.00000000 ],
		e: [ 0.20563593, 0.00002123 ],
		I: [ 7.00559432, -0.00590158 ],
		L: [ 252.25166724, 149472.67486623 ],
		wBar: [ 77.45771895, 0.15940013 ],
		om: [ 48.33961819, -0.12214182 ],
		aphelion: 69817445
	},{
		name: 'Venus',
		texture: './images/solarsystem/venusmap.jpg',
		size: 6051.8,
		period: 224.7008,
		a: [ 0.72332102, -0.00000026 ],
		e: [ 0.00676399, -0.00005107 ],
		I: [ 3.39777545, 0.00043494 ],
		L: [ 181.97970850, 58517.81560260 ],
		wBar: [ 131.76755713, 0.05679648 ],
		om: [ 76.67261496,-0.27274174 ],
		aphelion: 108942780
	},{
		name: 'Earth',
		texture: './images/solarsystem/earthmap2.jpg',
		size: 6371.00,
		period: 365.25636,               
		a: [ 1.00000018, -0.00000003 ],
		e: [ 0.01673163, -0.00003661 ],
		I: [ -0.00054346, -0.01337178 ],
		L: [ 100.46691572, 35999.37306329 ],
		wBar: [ 102.93005885, 0.31795260 ],
		om: [ -5.11260389, -0.24123856 ],
		aphelion: 152098233
	},{
		name: 'Mars',
		texture: './images/solarsystem/marsmap.jpg',
		size: 3389.5,
		period: 686.97959,
		a: [ 1.52371243, 0.00000097 ],
		e: [ 0.09336511, 0.00009149 ],
		I: [ 1.85181869, -0.00724757  ],
		L: [ -4.56813164, 19140.29934243 ],
		wBar: [ -23.91744784, 0.45223625 ],
		om: [ 49.71320984, -0.26852431 ],
		aphelion: 249232432
	},{
		name: 'Jupiter',
		texture: './images/solarsystem/jupitermap.jpg',
		size: 69911,
		period: 4332.8201,
		a: [ 5.20248019, -0.00002864 ],
		e: [ 0.04853590,  0.00018026 ],
		I: [ 1.29861416, -0.00322699  ],
		L: [ -34.33479152,  3034.90371757 ],
		wBar: [ 14.27495244, 0.18199196 ],
		om: [ 100.29282654, 0.13024619 ],
		aphelion: 816001807
	},{
		name: 'Saturn',
		texture: './images/solarsystem/saturnmap.jpg',
		size: 58232,
		period: 10755.699,             
		a: [ 9.54149883, -0.00003065 ],
		e: [ 0.05550825, -0.00032044 ],
		I: [ 2.49424102, 0.00451969  ],
		L: [ 50.07571329, 1222.11494724 ],
		wBar: [ 92.86136063, 0.54179478 ],
		om: [ 113.63998702, -0.25015002 ],
		aphelion: 1503509229
	},{
		name: 'Uranus',
		texture: './images/solarsystem/uranusmap.jpg',
		size: 30687.153,
		period: 30700,                  
		a: [ 19.18797948, -0.00020455 ],
		e: [ 0.04685740, -0.00001550 ],
		I: [ 0.77298127, -0.00180155  ],
		L: [ 314.20276625, 428.49512595 ],
		wBar: [ 172.43404441, 0.09266985 ],
		om: [ 73.96250215, 0.05739699 ],
		aphelion: 3006318143
	},{
		name: 'Neptune',
		texture: './images/solarsystem/neptunemap.jpg',
		size: 24622,
		period: 60190.03,
		a: [ 30.06952752, 0.00006447 ],
		e: [ 0.00895439, 0.00000818 ],
		I: [ 1.77005520, 0.00022400  ],
		L: [ 304.22289287, 218.46515314 ],
		wBar: [ 46.68158724, 0.01009938 ],
		om: [ 131.78635853, -0.00606302  ],
		aphelion: 4537039826
	}	
]