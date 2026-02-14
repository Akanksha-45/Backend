class ApiError extends Error {
    constructor(message = "something went wrong",
         statuscode,
         error =[],
         statck = ""

    ) {
        super(message)
        this.statuscode = statuscode
        this.data = null
        this.message = message
        this.success = false
        this.error = error
       
        if (statck) {
            this.statck = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
        
    }
}

export default ApiError