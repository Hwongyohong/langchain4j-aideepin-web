declare namespace User {
    interface Profile {
        avatar?: string
        name?: string
				userLevel?: number
        description?: string
				isAdmin?: boolean
      }

    interface Config{
        secretKey?: string
        contextEnable?: boolean
        contextMsgPairNum?: number
        quotaByTokenDaily?: number
        quotaByTokenMonthly?: number
        quotaByRequestDaily?: number
        quotaByRequestMonthly?: number
        quotaByImageDaily?: number
        quotaByImageMonthly?: number
        todayTokenCost?: number
        todayRequestTimes?: number
        todayGeneratedImageNumber?: number
        currMonthTokenCost?: number
        currMonthRequestTimes?: number
        currMonthGeneratedImageNumber?: number
    }


	interface UserInfo {
		uuid: string;
		name: string;
		userStatus: string;
		activeTime: number;
		userLevel: number;
	}

	interface UserConfig {
		uuid?: undefined;
		name?: undefined;
		userStatus?: undefined;
		activeTime?: undefined;
		userLevel?: undefined;
		quotaByTokenDaily?: undefined;
		quotaByTokenMonthly?: undefined;
		quotaByRequestDaily?: undefined;
		quotaByRequestMonthly?: undefined;
		quotaByImageDaily?: undefined;
		quotaByImageMonthly?: undefined;
	}
}
