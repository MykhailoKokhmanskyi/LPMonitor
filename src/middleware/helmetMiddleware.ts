import helmet from "helmet";

export const helmetMiddleware = helmet({
	referrerPolicy: {
		policy: "strict-origin-when-cross-origin",
	},
  	contentSecurityPolicy: {
    	directives: {
      		"default-src": ["'self'"],
      		"script-src": ["'self'", "https://challenges.cloudflare.com", "https://static.cloudflareinsights.com"],
      		"object-src": ["'none'"],
	  		"frame-src": ["'self'", "https://challenges.cloudflare.com"],
      		"upgrade-insecure-requests": [],
    	},
  	},
})
