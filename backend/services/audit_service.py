from models.audit_log import AuditLog


def log_action(db, action: str, entity: str, detail: str = None) -> None:
    log = AuditLog(action=action, entity=entity, detail=detail)
    db.add(log)
    db.commit()


def list_logs(db, limit: int = 100):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
